import puppeteer from "puppeteer";

export const scrapeWikipedia = async (searchQuery) => {
  let browser;
  try {
    // Launch the browser
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Navigate to Wikipedia
    await page.goto("https://wikipedia.org/");

    // Set screen size
    await page.setViewport({ width: 1080, height: 1024 });

    // Type into the search box
    await page.type("#searchInput", searchQuery);

    // Click on the search button
    const searchResultSelector = ".pure-button.pure-button-primary-progressive";
    await page.waitForSelector(searchResultSelector);
    await page.click(searchResultSelector);

    // Wait for the page to load and scrape the main content
    const contentSelector = ".mw-parser-output p";
    await page.waitForSelector(contentSelector);

    // Extract the text of the first paragraph
    const content = await page.evaluate(() => {
      const paragraphs = document.querySelectorAll(".mw-parser-output p");
      return Array.from(paragraphs)
        .map((p) => p.innerText.trim()) // Extract and clean up text
        .filter((text) => text.length > 0); // Filter out empty paragraphs
    });

    // Return scraped content
    return content.join("\n\n");
  } catch (error) {
    console.error("Error during scraping:", error);
    throw new Error("Failed to scrape Wikipedia");
  } finally {
    if (browser) await browser.close();
  }
};
