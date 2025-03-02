import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import { parse } from 'csv-parse';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Cache for storing parsed CSV data
let csvData = null;

// Function to parse CSV file
async function parseCSVFile() {
  try {
    const csvFilePath = join(__dirname, 'data', 'qof_data.csv');
    const fileContent = await fs.readFile(csvFilePath, 'utf-8');
    
    return new Promise((resolve, reject) => {
      parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  } catch (error) {
    console.error('Error reading CSV file:', error);
    throw error;
  }
}

// Initialize data on server start
async function initializeData() {
  try {
    csvData = await parseCSVFile();
    console.log('CSV data loaded successfully');
  } catch (error) {
    console.error('Failed to initialize data:', error);
  }
}

// Routes
app.get('/api/practices', async (req, res) => {
  try {
    if (!csvData) {
      await initializeData();
    }
    res.json(csvData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch practice data' });
  }
});

app.get('/api/practice/:code', async (req, res) => {
  try {
    if (!csvData) {
      await initializeData();
    }
    const practice = csvData.find(p => p.PRACTICE_CODE === req.params.code);
    if (practice) {
      res.json(practice);
    } else {
      res.status(404).json({ error: 'Practice not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch practice data' });
  }
});

app.get('/api/search', async (req, res) => {
  try {
    if (!csvData) {
      await initializeData();
    }
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchTerm = query.toLowerCase();
    const results = csvData
      .filter(practice => 
        practice.PRACTICE_CODE?.toString().toLowerCase().includes(searchTerm) ||
        practice.PRACTICE_NAME?.toString().toLowerCase().includes(searchTerm) ||
        practice.POST_CODE?.toString().toLowerCase().includes(searchTerm)
      )
      .slice(0, 10);

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search practices' });
  }
});

// Initialize data when server starts
initializeData();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 