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

  // --- NOUVEAUX ÉTATS IHM ---
  const [showSidebar, setShowSidebar] = useState(true);
  const [viewMode, setViewMode] = useState('split'); // Valeurs possibles: 'editor', 'preview', 'split'

  const fetchDocuments = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/documents');
      if (res.ok) setDocuments(await res.json());
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchDocuments(); }, []);

  const loadDocument = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/documents/${id}`);
      if (!res.ok) return;
      const data = await res.json();
      setSelectedId(data.id);
      setTitre(data.titre);
      setText(data.contenu);
    } catch (err) { console.error(err); }
  };

  const handleSave = async () => {
    if (!titre.trim() || !text.trim()) return alert("Remplissez le titre et le contenu !");
    try {
      const res = await fetch('http://localhost:5000/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titre, contenu: text })
      });
      if (res.ok) {
        handleNewDoc();
        fetchDocuments();
      }
    } catch (err) { console.error(err); }
  };

  const handleNewDoc = () => {
    setTitre(""); setText(""); setSelectedId(null);
  };

  const handleImageImport = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch('http://localhost:5000/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) setText((prev) => prev + `\nsrc="${data.url}"\n`);
    } catch (err) { console.error(err); }
  };

  // --- LOGIQUE D'IMPORTATION DE TEXTE (PDF, TXT, DOCX) ---
  const handleDocumentImport = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:5000/api/import-file', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Échec de l'extraction");
      }

      const data = await res.json();

      if (data.text) {
        // Ajoute le texte extrait proprement à la suite de l'éditeur avec une séparation visuelle
        setText((prevText) => prevText + `\n\n# --- Contenu importé : ${file.name} ---\n${data.text}\n`);
        alert(`Texte extrait avec succès de "${file.name}" !`);
      }
    } catch (err) {
      console.error("Erreur d'import :", err);
      alert(err.message || "Une erreur est survenue lors de la lecture du document.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0c] text-white flex font-sans overflow-hidden">
      
      {/* Sidebar - Dynamique */}
      <div className={`${showSidebar ? "w-64 opacity-100" : "w-0 opacity-0 overflow-hidden"} transition-all duration-300 ease-in-out shrink-0 border-r border-neutral-800`}>
        <div className="w-64">
          <Sidebar documents={documents} selectedId={selectedId} onSelectDoc={loadDocument} onNewDoc={handleNewDoc} />
        </div>
      </div>

      <main className="flex-1 p-6 flex flex-col h-screen overflow-hidden min-w-0">
        
        {/* Navbar avec tous les contrôles intégrés */}
        <Navbar 
          titre={titre} 
          setTitre={setTitre} 
          onSave={handleSave} 
          onImageImport={handleImageImport}
          onDocumentImport={handleDocumentImport} // <-- Ajoute cette ligne
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          viewMode={viewMode}
          setViewMode={setViewMode}
/>

        {/* Espace de travail avec grille dynamique selon viewMode */}
        <div className="flex gap-6 flex-1 min-h-0 w-full transition-all duration-300">
          
          {/* Section Éditeur */}
          {(viewMode === 'split' || viewMode === 'editor') && (
            <div className={`flex flex-col h-full ${viewMode === 'editor' ? 'w-full' : 'w-1/2'}`}>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full flex-1 resize-none rounded-2xl bg-[#121212] border border-neutral-800 p-5 font-mono text-sm text-neutral-300 focus:outline-none focus:border-neutral-700 shadow-inner"
                placeholder="Écris ta documentation ici..."
              />
            </div>
          )}

          {/* Section Aperçu */}
          {(viewMode === 'split' || viewMode === 'preview') && (
            <div className={`h-full overflow-y-auto rounded-2xl bg-[#121212]/30 border border-neutral-800/50 p-8 backdrop-blur-sm ${viewMode === 'preview' ? 'w-full' : 'w-1/2'}`}>
              <DocRenderer rawText={text} />
            </div>
          )}

        </div>
      </main>
    </div>
  );
}