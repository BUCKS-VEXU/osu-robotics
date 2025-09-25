// server.ts (ESM)
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import router from './routes/router.js';
import { configureAuth } from './auth.js';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

await configureAuth(app);

app.use('/api', router);

app.get('/merch', (_req, res) => {
  res.redirect('https://bucksrobotics.myshopify.com/collections/all');
});

app.use(express.static(path.join(__dirname, '../')));
app.get(/^\/(?!api\/).*/, (_req, res) => {
  res.sendFile(path.join(__dirname, '../', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
