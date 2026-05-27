require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path'); // <-- Ajoute ça
const multer = require('multer'); // <-- Ajoute ça


const app = express();
app.use(cors());
app.use(express.json());

// 1. Rendre le dossier "uploads" accessible via URL (ex: http://localhost:5000/uploads/...)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// 2. Configuration de Multer pour renommer et stocker les fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Le dossier où stocker les images
  },
  filename: (req, file, cb) => {
    // Génère un nom unique pour éviter les doublons (timestamp + extension d'origine)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// 3. NOUVELLE ROUTE : Recevoir l'image et renvoyer son URL
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Aucun fichier reçu" });
  }
  // On construit l'URL de l'image sur ton serveur local
  const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
  res.json({ url: imageUrl });
});

// --- Tes anciennes routes GET et POST pour les documents restent exactement les mêmes ---
app.get('/api/documents', async (req, res) => { 
  try {
    const result = await pool.query('SELECT * FROM documents ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
 });
app.get('/api/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM documents WHERE id = $1', [id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
 });
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