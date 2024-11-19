import puppeteer from "puppeteer";

(async () => {
  // Launch the browser and open a new page
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Navigate to Wikipedia
  await page.goto("https://wikipedia.org/");

  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 });

  // Type into the search box
  await page.type("#searchInput", "Automation");

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

  // Log the passage
  console.log("Scraped Content:");
  console.log(content.join("\n\n")); // Join paragraphs with double line breaks

  // Close the browser
  await browser.close();
})();
