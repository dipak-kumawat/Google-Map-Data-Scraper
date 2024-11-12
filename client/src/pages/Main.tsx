
import React, { useState } from 'react';

interface Place {
  name: string;
  address?: string;
  rating?: string;
  reviews?: string;
  category?: string;
  website?: string;
  phone?: string;
  hours?: string[];
}

const Main = () => {
  const [location, setLocation] = useState('');
  const [placeType, setPlaceType] = useState('');
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const placeTypes = [
    'pharmacy',
    'hotel',
    'restaurant',
    'cafe',
    'hospital',
    'school',
    'supermarket'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:3001/api/places', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ location, type: placeType }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError('Failed to fetch results. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Google Maps Location Scraper</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block mb-2">Location:</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter location (e.g., Manhattan, NY)"
              required
            />
          </div>
          
          <div>
            <label className="block mb-2">Place Type:</label>
            <select
              value={placeType}
              onChange={(e) => setPlaceType(e.target.value)}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select a type</option>
              {placeTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}

      {results.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Results</h2>
          <div className="grid gap-4">
            {results.map((place, index) => (
              <div key={index} className="border p-4 rounded shadow">
                <h3 className="font-bold text-lg">{place.name}</h3>
                {place.category && <p className="text-gray-600">{place.category}</p>}
                {place.rating && (
                  <p className="text-yellow-600">
                    Rating: {place.rating} {place.reviews && `(${place.reviews})`}
                  </p>
                )}
                {place.address && <p className="mt-2">{place.address}</p>}
                {place.phone && <p className="mt-1">{place.phone}</p>}
                {place.website && (
                  <a
                    href={place.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline mt-1 block"
                  >
                    Visit Website
                  </a>
                )}
                {place.hours && place.hours.length > 0 && (
                  <div className="mt-2">
                    <p className="font-semibold">Hours:</p>
                    <ul className="text-sm">
                      {place.hours.map((hour, i) => (
                        <li key={i}>{hour}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Main;
