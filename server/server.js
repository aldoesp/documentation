require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Connexion à PostgreSQL (adapte avec tes identifiants)
const pool = new Pool({
  user: 'admin',          // Ton utilisateur Postgres
  host: 'localhost',
  database: 'doc_db',        // Le nom de ta BDD
  password: 'admin', 
  port: 5432,
});

// Récupérer tous les documents (pour le menu)
app.get('/api/documents', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, titre FROM documents ORDER BY cree_le DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Récupérer un document spécifique par son ID
app.get('/api/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM documents WHERE id = $1', [id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Enregistrer un nouveau document
app.post('/api/documents', async (req, res) => {
  try {
    const { titre, contenu } = req.body;
    const result = await pool.query(
      'INSERT INTO documents (titre, contenu) VALUES ($1, $2) RETURNING *',
      [titre, contenu]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log("Serveur démarré sur le port 5000"));