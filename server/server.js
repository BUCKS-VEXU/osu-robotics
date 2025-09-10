// server.js (ESM)
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes.js';
import { configureAuth } from './auth.js';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

// 🔐 Auth & session first
configureAuth(app);

// Use router for api calls
app.use('/api', routes);

// Redirect to merch
app.get('/merch', (req, res) => {
  res.redirect('https://bucksrobotics.myshopify.com/collections/all');
});

// Serve built client
app.use(express.static(path.join(__dirname, '../dist')));

// Sends index.html for any GET that doesn't start with /api
app.get(/^\/(?!api\/).*/, (_req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
