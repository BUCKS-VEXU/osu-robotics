// server.ts (ESM/TS)
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes';
import { configureAuth } from './auth';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

await configureAuth(app);

app.use('/api', routes);

app.get('/merch', (_req, res) => {
  res.redirect('https://bucksrobotics.myshopify.com/collections/all');
});

app.use(express.static(path.join(__dirname, '../dist')));
app.get(/^\/(?!api\/).*/, (_req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
