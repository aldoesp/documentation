import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DocRenderer from './components/DocRenderer';
import './App.css';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [titre, setTitre] = useState("");
  const [text, setText] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  // --- LOGIQUE API ---
  const fetchDocuments = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/documents');
      if (!res.ok) throw new Error("Erreur de chargement");
      const data = await res.json();
      setDocuments(data);
    } catch (err) { console.error("Erreur liste :", err); }
  };

  useEffect(() => { fetchDocuments(); }, []);

  const loadDocument = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/documents/${id}`);
      if (!res.ok) throw new Error("Erreur de chargement du doc");
      const data = await res.json();
      setSelectedId(data.id);
      setTitre(data.titre);
      setText(data.contenu);
    } catch (err) { console.error("Erreur chargement :", err); }
  };

  const handleSave = async () => {
    if (!titre.trim() || !text.trim()) {
      alert("Veuillez remplir le titre et le contenu !");
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titre, contenu: text })
      });
      if (res.ok) {
        alert("Document et image sauvegardés dans la BDD !");
        handleNewDoc();
        fetchDocuments();
      } else { alert("Erreur lors de la sauvegarde."); }
    } catch (err) { console.error("Erreur sauvegarde :", err); }
  };

  const handleNewDoc = () => {
    setTitre(""); setText(""); setSelectedId(null);
  };

  // --- NOUVELLE LOGIQUE D'UPLOAD D'IMAGE (SANS BASE64) ---
  const handleImageImport = async (file) => {
    if (!file) return;

    // Création d'un formulaire virtuel pour envoyer le fichier physique
    const formData = new FormData();
    formData.append('image', file);

    try {
      // 1. Envoi de l'image brute au serveur Node
      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData, // Pas de Content-Type header ici, le navigateur s'en charge
      });

      if (!res.ok) throw new Error("Échec de l'upload de l'image");

      const data = await res.json();
      
      // 2. Le serveur nous renvoie la vraie URL (ex: http://localhost:5000/uploads/1716...)
      if (data.url) {
        // 3. On injecte l'URL propre dans notre éditeur de texte
        setText((prevText) => prevText + `\nsrc="${data.url}"\n`);
      }
    } catch (err) {
      console.error("Erreur lors de l'upload :", err);
      alert("Impossible d'importer l'image sur le serveur.");
    }
  };

  // --- RENDU ---
  return (
    <div className="min-h-screen bg-[#0b0b0c] text-white flex font-sans overflow-hidden">
      
      <Sidebar 
        documents={documents} 
        selectedId={selectedId} 
        onSelectDoc={loadDocument} 
        onNewDoc={handleNewDoc} 
      />

      <main className="flex-1 p-6 flex flex-col h-screen overflow-hidden">
        
        {/* On passe la nouvelle fonction handleImageImport au composant Navbar */}
        <Navbar 
          titre={titre} 
          setTitre={setTitre} 
          onSave={handleSave} 
          onImageImport={handleImageImport}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
          <div className="flex flex-col h-full">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full flex-1 resize-none rounded-2xl bg-[#121212] border border-neutral-800 p-5 font-mono text-sm text-neutral-300 focus:outline-none focus:border-neutral-700 shadow-inner"
              placeholder="Écris ta documentation ici... &#10;# pour un Titre&#10;$ pour une commande&#10;src='lien' pour une image"
            />
          </div>

          <div className="h-full overflow-y-auto rounded-2xl bg-[#121212]/30 border border-neutral-800/50 p-8 backdrop-blur-sm">
            <DocRenderer rawText={text} />
          </div>
        </div>
      </main>
    </div>
  );
}