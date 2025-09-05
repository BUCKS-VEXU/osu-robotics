// server.js (ES Module)
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import {fileURLToPath} from 'url';

dotenv.config();

const app = express();

// Create __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to parse JSON requests
app.use(express.json());

// Serve static files from the "dist" folder (built React app)
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all: send index.html for React Router to handle routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
