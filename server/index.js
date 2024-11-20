import express from "express";
import { scrapeWikipedia } from "./WikipediaScraper.js";
import cors from "cors";

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  optionSuccessStatus: 200,
};

const app = express();
app.use(cors()); // Enable CORS for all routes
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// API endpoint
app.post("/scrape", async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  try {
    const content = await scrapeWikipedia(query);
    console.log(content)
    res.status(200).json({ query, content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
