import express from 'express';
import pg from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';
// import path from 'path';
// import { fileURLToPath } from 'url';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Allow requests from the React app
  })); // Allow requests from React development server
app.use(express.json());

// PostgreSQL connection pool
const pool = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Root route
// app.get('/', (req, res) => {
//   res.send('Welcome to the server!');
// });

// API Routes
app.get('/notes', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM notes');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.post('/notes', async (req, res) => {
    const { title, content } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO notes (title, content) VALUES ($1, $2) RETURNING *',
            [title, content]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.delete('/notes/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM notes WHERE id = $1', [id]);
        res.sendStatus(204);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Serve React app in production
// if (process.env.NODE_ENV === 'production') {
//     app.use(express.static(path.join(__dirname, 'dist')));
//     app.get('*', (req, res) => {
//         res.sendFile(path.join(__dirname, 'dist', 'index.html'));
//     });
// }

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
