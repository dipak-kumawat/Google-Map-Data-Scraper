import React, { useState } from "react";
import axios from "axios";

const ScraperForm: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult("");
    setError("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:3000/scrape", { query });
      setResult(response.data.content);
    } catch (err) {
      setError("Failed to scrape content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Wikipedia Scraper</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Enter search query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? "Scraping..." : "Scrape"}
        </button>
      </form>
      {error && <div className="mt-4 text-red-500">{error}</div>}
      {result && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Scraped Content:</h2>
          <p className="text-gray-600 whitespace-pre-wrap">{result}</p>
        </div>
      )}
    </div>
  );
};

export default ScraperForm;
