import { GoogleMapsScraper } from './GoogleMapsScraper.js';

async function main() {
    const scraper = new GoogleMapsScraper({
        maxRetries: 5,
        delayBetweenRequests: 2000,
        scrollAttempts: 15
    });

    try {
        const city = 'Nashik';
        const results = await scraper.scrapeGoogleMaps(city);
        console.log('Scraping completed successfully!');
        console.log(`Total results: ${results.length}`);
    } catch (error) {
        console.error('Scraping failed:', error);
    }
}

main();