import React, { useState, useEffect } from 'react';
import './App.css';

// === COMPOSANT CODEBLOCK (Inchangé) ===
const CodeBlock = ({ content }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="my-3 flex items-center justify-between rounded-xl bg-[#121212] border border-neutral-800 p-4 font-mono text-sm text-neutral-200">
      <code>{content}</code>
      <button onClick={handleCopy} className={`px-3 py-1.5 text-xs rounded-lg ${copied ? 'bg-emerald-500/10 text-emerald-400' : 'bg-neutral-800 text-neutral-400'}`}>
        {copied ? 'Copié' : 'Copier'}
      </button>
    </div>
  );
};

// === INTERPRÉTEUR DE LIGNES (Inchangé) ===
const DocRenderer = ({ rawText }) => {
  if (!rawText) return <p className="text-neutral-500 italic">L'aperçu s'affichera ici...</p>;
  const lines = rawText.split('\n');
  return (
    <div className="space-y-3 text-neutral-300">
      {lines.map((line, index) => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('#')) return <p key={index} className="text-xl font-bold text-white mt-4">{trimmedLine.substring(1).trim()}</p>;
        if (trimmedLine.startsWith('src="')) {
          const src = trimmedLine.match(/"([^"]+)"/)?.[1];
          return src ? <div key={index} className="my-4 rounded-lg overflow-hidden border border-neutral-800"><img src={src} alt="Doc" /></div> : null;
        }
        if (trimmedLine.startsWith('$')) return <CodeBlock key={index} content={trimmedLine.substring(1).trim()} />;
        if (trimmedLine === '') return <div key={index} className="h-2" />;
        return <p key={index} className="text-neutral-400">{line}</p>;
      })}
    </div>
  );
};

// === COMPOSANT PRINCIPAL ===
export default function App() {
  const [documents, setDocuments] = useState([]);
  const [titre, setTitre] = useState("");
  const [text, setText] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  // 1. Charger la liste des docs au démarrage
  const fetchDocuments = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/documents');
      const data = await res.json();
      setDocuments(data);
    } catch (err) {
      console.error("Erreur chargement liste :", err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // 2. Charger un doc précis au clic dans le menu
  const loadDocument = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/documents/${id}`);
      const data = await res.json();
      setSelectedId(data.id);
      setTitre(data.titre);
      setText(data.contenu);
    } catch (err) {
      console.error("Erreur chargement doc :", err);
    }
  };

  // 3. Sauvegarder un nouveau document
  const handleSave = async () => {
    if (!titre.trim() || !text.trim()) return alert("Remplis le titre et le contenu !");
    try {
      const res = await fetch('http://localhost:5000/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titre, contenu: text })
      });
      if (res.ok) {
        alert("Document sauvegardé !");
        setTitre("");
        setText("");
        setSelectedId(null);
        fetchDocuments(); // Rafraîchit le menu
      }
    } catch (err) {
      console.error("Erreur sauvegarde :", err);
    }
  };

  // 4. Bouton pour vider l'éditeur et créer un nouveau doc
  const handleNewDoc = () => {
    setTitre("");
    setText("");
    setSelectedId(null);
  };

  return (
    <div className="min-h-screen bg-[#0b0b0c] text-white flex font-sans">
      
      {/* BARRE LATÉRALE : Le Menu des documents */}
      <aside className="w-64 bg-[#121212] border-r border-neutral-800 p-4 flex flex-col justify-between">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-4">Mes Documents</h2>
          <div className="space-y-1 overflow-y-auto max-h-[70vh]">
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => loadDocument(doc.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all truncate block ${
                  selectedId === doc.id ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200'
                }`}
              >
                📄 {doc.titre}
              </button>
            ))}
          </div>
        </div>

        {/* Bouton pour créer un nouveau doc en bas du menu */}
        <button
          onClick={handleNewDoc}
          className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm py-2 px-4 rounded-xl border border-neutral-700 font-medium transition-all"
        >
          + Nouveau Document
        </button>
      </aside>

      {/* ZONE PRINCIPALE (Éditeur + Rendu) */}
      <main className="flex-1 p-6 flex flex-col">
        <header className="mb-6 flex gap-4 items-center">
          <input
            type="text"
            placeholder="Titre du document..."
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            className="bg-[#121212] border border-neutral-800 rounded-xl px-4 py-2 text-sm w-64 focus:outline-none focus:border-neutral-700 text-white"
          />
          <button
            onClick={handleSave}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-4 py-2 rounded-xl font-medium transition-all"
          >
            Enregistrer dans la BDD
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 h-[calc(100vh-140px)]">
          {/* Éditeur */}
          <div className="flex flex-col">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full flex-1 resize-none rounded-xl bg-[#121212] border border-neutral-800 p-4 font-mono text-sm text-neutral-300 focus:outline-none focus:border-neutral-700"
              placeholder="Écris ta doc ici..."
            />
          </div>

          {/* Rendu */}
          <div className="w-full overflow-y-auto rounded-xl bg-[#121212]/40 border border-neutral-800 p-6">
            <DocRenderer rawText={text} />
          </div>
        </div>
      </main>

    </div>
  );
}