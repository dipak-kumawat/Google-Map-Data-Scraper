import puppeteer from "puppeteer";
import { promises as fs } from "fs";
import proxyChain from "proxy-chain";
import UserAgent from "user-agents";
import path from "path";
import { fileURLToPath } from "url";
import { proxyList } from "./proxy.js";

import { ProxyPool } from "./ProxyPool.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class GoogleMapsScraper {
  constructor(options = {}) {
    this.proxyPool = new ProxyPool(proxyList);
    this.options = {
      maxRetries: options.maxRetries || 3,
      delayBetweenRequests: options.delayBetweenRequests || 2000,
      scrollAttempts: options.scrollAttempts || 15,
    };
  }

  async randomDelay(min = 500, max = 3000) {
    const delay = Math.floor(Math.random() * (max - min) + min);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  async initializeBrowser() {
    const userAgent = new UserAgent({ deviceCategory: "desktop" });
    let currentProxy = this.proxyPool.getNext();
    let anonymizedProxy;

    try {
      anonymizedProxy = await proxyChain.anonymizeProxy(currentProxy);

      const browser = await puppeteer.launch({
        headless: true,
        args: [
          "--disable-web-security",
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-infobars",
          "--window-position=0,0",
          "--ignore-certifcate-errors",
          "--ignore-certifcate-errors-spki-list",
          `--proxy-server=${anonymizedProxy}`,
          `--user-agent=${userAgent.toString()}`,
        ],
        defaultViewport: {
          width: 1920,
          height: 1080,
        },
      });

      console.log(`Successfully connected using proxy: ${currentProxy}`);
      return { browser, anonymizedProxy, success: true };
    } catch (error) {
      console.error(
        `Failed to connect using proxy ${currentProxy}:`,
        error.message
      );
      this.proxyPool.markAsFailed(currentProxy);
      return { browser: null, anonymizedProxy: null, success: false };
    }
  }

  async setupPage(browser) {
    const page = await browser.newPage();

    // Enable stealth mode
    await page.evaluateOnNewDocument(() => {
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) =>
        parameters.name === "notifications"
          ? Promise.resolve({ state: Notification.permission })
          : originalQuery(parameters);

      Object.defineProperty(navigator, "webdriver", {
        get: () => false,
      });

      window.chrome = {
        runtime: {},
      };
    });

    await page.evaluateOnNewDocument(() => {
      localStorage.setItem("visited_before", "true");
      localStorage.setItem("session_started", Date.now().toString());
    });

    return page;
  }

  async extractBusinessData(page) {
    return await page.evaluate(() => {
      const results = [];
      const items = document.querySelectorAll('div[role="article"]');

      items.forEach((item) => {
        try {
          const name =
            item.querySelector('div[role="heading"]')?.innerText?.trim() || "";
          const rating =
            item
              .querySelector('span[role="img"]')
              ?.getAttribute("aria-label")
              ?.match(/\d+(\.\d+)?/)?.[0] || "";
          const reviewCount =
            item
              .querySelector('span[aria-label*="reviews"]')
              ?.innerText?.replace(/[^0-9]/g, "") || "";
          const address =
            item
              .querySelector('button[data-item-id*="address"]')
              ?.innerText?.trim() || "";
          const phone =
            item
              .querySelector('button[data-item-id*="phone"]')
              ?.innerText?.trim() || "";
          const website =
            item.querySelector('a[data-item-id*="authority"]')?.href || "";
          const category =
            Array.from(item.querySelectorAll('button[jsaction*="pane"]'))
              .find(
                (el) =>
                  el.textContent.includes("restaurant") ||
                  el.textContent.includes("ice cream")
              )
              ?.innerText?.trim() || "";

          if (name) {
            results.push({
              name,
              rating: rating ? parseFloat(rating) : null,
              reviewCount: reviewCount ? parseInt(reviewCount) : null,
              address,
              phone,
              website,
              category,
              timestamp: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error("Error extracting business data:", error);
        }
      });

      return results;
    });
  }

  async scrapeGoogleMaps(city) {
    let browser;
    let anonymizedProxy;
    let retryCount = 0;

    while (retryCount < this.options.maxRetries) {
      try {
        const initResult = await this.initializeBrowser();
        if (!initResult.success) {
          console.log("Retrying with different proxy...");
          continue;
        }

        browser = initResult.browser;
        anonymizedProxy = initResult.anonymizedProxy;
        const page = await this.setupPage(browser);

        await page.goto("https://www.google.com/maps", {
          waitUntil: "networkidle2",
        });
        await this.randomDelay();

        await page.waitForSelector("#searchboxinput");
        await page.type("#searchboxinput", `ice cream parlor in ${city}`, {
          delay: 100,
        });
        await this.randomDelay(800, 1500);
        await page.click("#searchbox-searchbutton");

        await page.waitForSelector('div[role="article"]');
        await this.randomDelay();

        const results = new Set();
        let previousResultsLength = 0;
        let scrollAttempts = 0;

        while (scrollAttempts < this.options.scrollAttempts) {
          const currentResults = await this.extractBusinessData(page);

          currentResults.forEach((result) => {
            const resultKey = `${result.name}-${result.address}`;
            if (
              !Array.from(results).some(
                (r) => `${r.name}-${r.address}` === resultKey
              )
            ) {
              results.add(result);
            }
          });

          if (results.size === previousResultsLength) {
            scrollAttempts++;
          } else {
            scrollAttempts = 0;
          }

          previousResultsLength = results.size;

          await page.evaluate(() => {
            const feed = document.querySelector('div[role="feed"]');
            if (feed) {
              const scrollAmount = Math.floor(Math.random() * 400) + 400;
              feed.scrollTop += scrollAmount;
            }
          });

          await this.randomDelay();
        }

        const finalResults = Array.from(results);
        const outputFileName = `ice-cream-parlors-${city
          .toLowerCase()
          .replace(/\s+/g, "-")}-${Date.now()}.json`;

        await fs.writeFile(
          path.join(process.cwd(), outputFileName),
          JSON.stringify(
            {
              metadata: {
                city,
                totalResults: finalResults.length,
                scrapedAt: new Date().toISOString(),
                success: true,
              },
              results: finalResults,
            },
            null,
            2
          )
        );

        console.log(
          `Successfully scraped ${finalResults.length} ice cream parlors in ${city}`
        );
        return finalResults;
      } catch (error) {
        console.error(`Attempt ${retryCount + 1} failed:`, error.message);
        retryCount++;

        if (retryCount === this.options.maxRetries) {
          throw new Error(
            `Failed to scrape after ${this.options.maxRetries} attempts`
          );
        }

        await this.randomDelay(5000, 10000);
      } finally {
        if (browser) await browser.close();
        if (anonymizedProxy)
          await proxyChain.closeAnonymizedProxy(anonymizedProxy);
      }
    }
  }
}
