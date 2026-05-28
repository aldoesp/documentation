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

  const [showSidebar, setShowSidebar] = useState(true);
  const [viewMode, setViewMode] = useState('split');

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
      if (res.ok) { alert("Document sauvegardé en BDD !"); fetchDocuments(); }
    } catch (err) { console.error(err); }
  };

  const handleNewDoc = () => { setTitre(""); setText(""); setSelectedId(null); };

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

  const handleDocumentImport = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('http://localhost:5000/api/import-file', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.text) setText((prev) => prev + `\n\n# --- Importé: ${file.name} ---\n${data.text}\n`);
    } catch (err) { console.error(err); }
  };

  // --- FONCTIONNALITÉ GLOBO-EXPORTATION ---
  const handleExport = (format) => {
    const filename = titre.trim() ? titre.replace(/\s+/g, '_') : 'document_export';

    if (format === 'md') {
      // 1. Export Markdown brut
      const blob = new Blob([text], { type: 'text/markdown;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.md`;
      link.click();
      URL.revokeObjectURL(url);
    } 
    else if (format === 'html') {
      // 2. Export HTML autonome (récupération du rendu graphique de DocRenderer)
      const previewContent = document.getElementById('preview-pane')?.innerHTML || '';
      const htmlTemplate = `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <title>${titre || 'Document'}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; background: #fff; color: #1a1a1a; line-height: 1.6; }
            h1 { font-size: 2.25em; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
            h2 { font-size: 1.75em; margin-top: 30px; }
            pre { background: #f3f4f6; padding: 16px; rounded: 8px; overflow-x: auto; font-family: monospace; border-radius: 8px; }
            code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
            img { max-width: 100%; height: auto; border-radius: 8px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <h1>${titre || 'Sans titre'}</h1>
          <div>${previewContent}</div>
        </body>
        </html>
      `;
      const blob = new Blob([htmlTemplate], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.html`;
      link.click();
      URL.revokeObjectURL(url);
    } 
    else if (format === 'pdf') {
      // 3. Export PDF via l'utilitaire d'impression natif optimisé
      window.print();
    }
  };

  return (
    // Lors du print PDF, on bascule le fond global en blanc et l'écriture en noir
    <div className="min-h-screen bg-[#0b0b0c] text-white flex font-sans overflow-hidden print:bg-white print:text-black">
      
      {/* Sidebar (Masquée lors de l'impression) */}
      <div className={`${showSidebar ? "w-64 opacity-100" : "w-0 opacity-0 overflow-hidden"} transition-all duration-300 ease-in-out shrink-0 border-r border-neutral-800 print:hidden`}>
        <div className="w-64">
          <Sidebar documents={documents} selectedId={selectedId} onSelectDoc={loadDocument} onNewDoc={handleNewDoc} />
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 p-6 flex flex-col h-screen overflow-hidden min-w-0 print:p-0 print:h-auto print:overflow-visible">
        
        <Navbar 
          titre={titre} setTitre={setTitre} 
          onSave={handleSave} onImageImport={handleImageImport} onDocumentImport={handleDocumentImport}
          onExport={handleExport} // <-- Passage de la fonction d'exportation
          showSidebar={showSidebar} setShowSidebar={setShowSidebar}
          viewMode={viewMode} setViewMode={setViewMode}
        />

        {/* Espace de travail adaptatif */}
        <div className="flex gap-6 flex-1 min-h-0 w-full transition-all duration-300 print:block">
          
          {/* Éditeur (Masqué lors du print PDF) */}
          {(viewMode === 'split' || viewMode === 'editor') && (
            <div className={`flex flex-col h-full print:hidden ${viewMode === 'editor' ? 'w-full' : 'w-1/2'}`}>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full flex-1 resize-none rounded-2xl bg-[#121212] border border-neutral-800 p-5 font-mono text-sm text-neutral-300 focus:outline-none focus:border-neutral-700 shadow-inner"
                placeholder="Écris ta documentation ici..."
              />
            </div>
          )}

          {/* Zone d'Aperçu (Prend 100% de la page lors du print PDF) */}
          {(viewMode === 'split' || viewMode === 'preview') && (
            <div 
              id="preview-pane" // Identifiant pour récupérer le HTML interne
              className={`h-full overflow-y-auto rounded-2xl bg-[#121212]/30 border border-neutral-800/50 p-8 backdrop-blur-sm transition-all duration-300 
                print:w-full print:h-auto print:overflow-visible print:bg-white print:text-black print:p-0 print:border-none ${
                viewMode === 'preview' ? 'w-full' : 'w-1/2'
              }`}
            >
              {/* Titre inséré uniquement pour la mise en page PDF imprimée */}
              <h1 className="hidden print:block text-3xl font-bold mb-4 border-b pb-2 text-black">{titre || "Sans titre"}</h1>
              
              <DocRenderer rawText={text} />
            </div>
          )}

        </div>
      </main>
    </div>
  );
}