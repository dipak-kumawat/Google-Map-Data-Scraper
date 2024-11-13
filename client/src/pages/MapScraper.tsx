import React, { useState } from 'react';
import { Search, Send, Loader2 } from 'lucide-react';

const MapScraper = () => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [radius, setRadius] = useState('5');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Array<{
    name: string;
    address: string;
    rating: number;
    reviews: number;
    phone?: string;
  }>>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulating API call - replace with actual implementation
    setTimeout(() => {
      setResults([
        {
          name: "Sample Business 1",
          address: "123 Main St",
          rating: 4.5,
          reviews: 123,
          phone: "555-0123"
        },
        {
          name: "Sample Business 2",
          address: "456 Oak Ave",
          rating: 4.2,
          reviews: 89,
          phone: "555-0456"
        }
      ]);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Google Maps Data Scraper</h1>
        <p className="text-gray-600">Enter search criteria to scrape business data from Google Maps</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div className="space-y-2">
          <label className="block font-medium">Search Query</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., restaurants, hotels, cafes"
              className="pl-10 w-full p-2 border rounded-md"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block font-medium">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State or Address"
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-medium">Radius (km)</label>
            <input
              type="number"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              min="1"
              max="50"
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !query || !location}
          className="w-full bg-blue-600 text-white p-3 rounded-md flex items-center justify-center gap-2 disabled:bg-blue-400"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Scraping Data...
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              Start Scraping
            </>
          )}
        </button>
      </form>

      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Results</h2>
          <div className="grid gap-4">
            {results.map((result, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-lg">{result.name}</h3>
                <p className="text-gray-600">{result.address}</p>
                <div className="mt-2 flex items-center gap-4">
                  <span className="text-yellow-500">★ {result.rating}</span>
                  <span className="text-gray-500">({result.reviews} reviews)</span>
                  {result.phone && <span className="text-gray-500">{result.phone}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapScraper;