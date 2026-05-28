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

  // --- FONCTIONNALITÉ DE GLOBALE EXPORTATION OPTIMISÉE ---
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
      // Récupération de l'ensemble de la zone d'aperçu
      const previewContent = document.getElementById('preview-pane')?.innerHTML || '';

      // Génération d'un gabarit HTML autonome, stylisé et adaptatif
      const htmlTemplate = `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${titre || 'Document Exporté'}</title>
          
          <script src="https://cdn.tailwindcss.com"></script>
          
          <style>
            body { 
              background-color: #0b0b0c !important; 
              color: #e5e7eb !important;
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.7;
            }
            /* Correction IHM : Forcer l'affichage du titre h1 qui était masqué à l'écran */
            h1.print\\:block { 
              display: block !important; 
              font-size: 2.5rem !important; 
              font-weight: 800 !important; 
              color: #ffffff !important; 
              border-bottom: 2px solid #262626 !important; 
              padding-bottom: 0.75rem !important; 
              margin-top: 1rem !important;
              margin-bottom: 2rem !important; 
            }
            /* Fallback de sécurité pour balises Markdown pures */
            h2 { font-size: 1.75rem !important; font-weight: 700 !important; color: #10b981 !important; margin-top: 2.5rem !important; margin-bottom: 1.25rem !important; border-bottom: 1px solid #1f1f23 !important; padding-bottom: 0.4rem !important; }
            h3 { font-size: 1.35rem !important; font-weight: 600 !important; color: #ffffff !important; margin-top: 2rem !important; margin-bottom: 1rem !important; }
            p { margin-bottom: 1.25rem !important; color: #d1d5db !important; font-size: 1rem !important; }
            
            /* Listes */
            ul { list-style-type: disc !important; padding-left: 1.75rem !important; margin-bottom: 1.25rem !important; }
            ol { list-style-type: decimal !important; padding-left: 1.75rem !important; margin-bottom: 1.25rem !important; }
            li { margin-bottom: 0.5rem !important; color: #d1d5db !important; }
            
            /* Blocs de code & inline code */
            pre { background-color: #121212 !important; border: 1px solid #262626 !important; padding: 1.25rem !important; border-radius: 0.75rem !important; overflow-x: auto !important; margin-bottom: 1.5rem !important; }
            code { font-family: 'Fira Code', Consolas, Monaco, monospace !important; font-size: 0.9em !important; }
            :not(pre) > code { background-color: #1a1a1e !important; color: #f43f5e !important; padding: 0.2rem 0.5rem !important; border-radius: 0.375rem !important; font-weight: 500 !important; }
            
            /* Images immersives */
            img { max-width: 100% !important; height: auto !important; border-radius: 0.75rem !important; margin: 2rem auto !important; display: block; border: 1px solid #262626 !important; shadow: 0 10px 15px -3px rgba(0,0,0,0.5); }
            
            /* Tableaux complexes structurés */
            table { width: 100% !important; border-collapse: collapse !important; margin-bottom: 1.75rem !important; font-size: 0.95rem !important; }
            th, td { border: 1px solid #262626 !important; padding: 0.85rem 1rem !important; text-align: left !important; }
            th { background-color: #121212 !important; color: #ffffff !important; font-weight: 600 !important; }
            tr:nth-child(even) { background-color: #121212/40 !important; }
            
            /* Citations */
            blockquote { border-left: 4px solid #10b981 !important; padding-left: 1.25rem !important; color: #9ca3af !important; font-style: italic !important; margin: 1.75rem 0 !important; background-color: #121212/20 !important; padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; border-radius: 0 0.5rem 0.5rem 0; }
          </style>
        </head>
        <body class="bg-[#0b0b0c] text-neutral-200 antialiased">
          <div class="max-w-3xl mx-auto px-6 py-12">
            ${previewContent}
          </div>
        </body>
        </html>
      `;

      // Compilation et téléchargement instantané du fichier HTML autonome
      const blob = new Blob([htmlTemplate], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.html`;
      link.click();
      URL.revokeObjectURL(url);
    } 
    else if (format === 'pdf') {
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