require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path'); // <-- Ajoute ça
const multer = require('multer'); // <-- Ajoute ça
const crypto = require('crypto'); // <-- Ajoute ça
const pdf = require('pdf-parse'); // <-- Ajoute ça
const mammoth = require('mammoth'); // <-- Ajoute ça
const fs = require('fs'); // <-- Ajoute ça


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

// Configuration basique de Multer  (On garde les fichiers temporairement)
const upload = multer({dest: 'uploads/'});

// --- NOUVELLE ROUTE SÉCURISÉE ET OPTIMISÉE ---
app.post('/api/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Aucun fichier reçu" });
  }

  const tempPath = req.file.path; // Chemin du fichier que Multer vient de créer

  try {
    // 1. Calculer le hash SHA-256 de l'image reçue
    const fileBuffer = fs.readFileSync(tempPath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    const fileHash = hashSum.digest('hex'); // Voici l'identifiant unique de ton image

    // 2. Vérifier si ce hash existe déjà dans PostgreSQL
    const checkQuery = 'SELECT filename FROM images WHERE hash = $1';
    const checkResult = await pool.query(checkQuery, [fileHash]);

    if (checkResult.rows.length > 0) {
      // ÉVITER LA REDONDANCE : L'image existe déjà !
      const existingFilename = checkResult.rows[0].filename;
      
      // On supprime le fichier temporaire qui vient d'être uploadé pour ne pas gâcher de l'espace
      fs.unlinkSync(tempPath); 

      // On renvoie l'URL de l'ancienne image déjà stockée
      const imageUrl = `http://localhost:5000/uploads/${existingFilename}`;
      return res.json({ url: imageUrl, message: "Image existante réutilisée (Optimisation)" });
    }

    // 3. Si l'image est nouvelle : On la renomme proprement avec son extension
    const extension = path.extname(req.file.originalname);
    const finalFilename = `${fileHash}${extension}`; // Le nom du fichier devient son propre Hash
    const finalPath = path.join('uploads/', finalFilename);

    fs.renameSync(tempPath, finalPath); // On applique le changement de nom

    // 4. On enregistre cette nouvelle image dans la base de données
    const insertQuery = 'INSERT INTO images (hash, filename) VALUES ($1, $2)';
    await pool.query(insertQuery, [fileHash, finalFilename]);

    // 5. On renvoie l'URL de la nouvelle image
    const imageUrl = `http://localhost:5000/uploads/${finalFilename}`;
    res.json({ url: imageUrl, message: "Nouvelle image enregistrée" });

  } catch (err) {
    console.error("Erreur lors de la déduplication :", err);
    // En cas de crash, on nettoie le fichier temporaire s'il existe toujours
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    res.status(500).json({ error: "Erreur serveur lors du traitement de l'image" });
  }
});

// --- NOUVELLE ROUTE : EXTRACTION DE TEXTE DEPUIS UN DOCUMENT ---
app.post('/api/import-file', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Aucun fichier reçu" });
  }

  const filePath = req.file.path;
  const extension = path.extname(req.file.originalname).toLowerCase();

  try {
    let extractedText = "";

    // 1. Traitement selon l'extension du fichier
    if (extension === '.txt') {
      extractedText = fs.readFileSync(filePath, 'utf-8');
    } 
    else if (extension === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdf(dataBuffer);
      extractedText = pdfData.text;
    } 
    else if (extension === '.docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      extractedText = result.value; // Contient le texte brut extrait du Word
    } 
    else {
      fs.unlinkSync(filePath); // Nettoyage
      return res.status(400).json({ error: "Format non supporté. Utilisez .txt, .pdf ou .docx" });
    }

    // 2. Nettoyage du fichier temporaire sur le disque
    fs.unlinkSync(filePath);

    // 3. Envoi du texte brut au Frontend
    res.json({ text: extractedText });

  } catch (err) {
    console.error("Erreur lors de l'extraction du fichier :", err);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath); // Sécurité
    res.status(500).json({ error: "Impossible de lire le contenu de ce fichier." });
  }
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