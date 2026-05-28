import React, { useState, useRef } from 'react';
// Importation des icônes spécifiques pour les formats de fichiers
import { 
  SquarePen, 
  Columns, 
  Eye, 
  PanelLeftClose, 
  PanelLeftOpen, 
  Image, 
  FileUp, 
  Save,
  Download,
  ChevronDown,
  FileText, // Pour le Markdown et le PDF
  FileCode  // Pour l'HTML
} from 'lucide-react';

const Navbar = ({ 
  titre, setTitre, onSave, onImageImport, onDocumentImport, onExport,
  showSidebar, setShowSidebar, viewMode, setViewMode 
}) => {
  const imageInputRef = useRef(null);
  const docInputRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="mb-6 flex gap-4 items-center justify-between bg-[#0b0b0c] py-2 print:hidden">
      
      {/* GAUCHE : Saisie du titre */}
      <div className="relative w-1/3 min-w-[250px]">
        <input
          type="text"
          placeholder="Titre du document..."
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          className="w-full bg-[#121212] border border-neutral-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-neutral-600 text-white transition-all"
        />
      </div>

      {/* DROITE : Contrôles et Actions */}
      <div className="flex items-center gap-3 relative">
        
        {/* Sélecteur de Mode de Vue */}
        <div className="flex bg-[#121212] rounded-xl p-1 border border-neutral-800">
          <button onClick={() => setViewMode('editor')} title="Saisie" className={`p-2 rounded-lg transition-all ${viewMode === 'editor' ? 'bg-neutral-800 text-white' : 'text-neutral-500'}`}><SquarePen className="w-4 h-4" /></button>
          <button onClick={() => setViewMode('split')} title="Scindé" className={`p-2 rounded-lg transition-all ${viewMode === 'split' ? 'bg-neutral-800 text-white' : 'text-neutral-500'}`}><Columns className="w-4 h-4" /></button>
          <button onClick={() => setViewMode('preview')} title="Aperçu" className={`p-2 rounded-lg transition-all ${viewMode === 'preview' ? 'bg-neutral-800 text-white' : 'text-neutral-500'}`}><Eye className="w-4 h-4" /></button>
        </div>

        {/* Bouton Menu Latéral */}
        <button onClick={() => setShowSidebar(!showSidebar)} className="p-2 rounded-xl border border-neutral-800 bg-transparent text-neutral-400 hover:bg-[#121212]">
          {showSidebar ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
        </button>

        <div className="w-px h-6 bg-neutral-800 mx-1"></div>

        {/* Inputs cachés pour l'import */}
        <input type="file" ref={imageInputRef} onChange={(e) => e.target.files[0] && onImageImport(e.target.files[0])} accept="image/*" className="hidden" />
        <input type="file" ref={docInputRef} onChange={(e) => e.target.files[0] && onDocumentImport(e.target.files[0])} accept=".txt,.pdf,.docx" className="hidden" />
        
        <button onClick={() => imageInputRef.current.click()} className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm px-4 py-2.5 rounded-xl font-medium border border-neutral-700 transition-all flex items-center gap-2">
          <Image className="w-4 h-4 text-neutral-400" />
          <span>Image</span>
        </button>

        <button onClick={() => docInputRef.current.click()} className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm px-4 py-2.5 rounded-xl font-medium border border-neutral-700 transition-all flex items-center gap-2">
          <FileUp className="w-4 h-4 text-neutral-400" />
          <span>Doc</span>
        </button>

        {/* MENU DÉROULANT EXPORT UNIFORMISÉ */}
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm px-4 py-2.5 rounded-xl font-medium border border-neutral-700 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-neutral-400" />
            <span>Exporter</span>
            <ChevronDown className="w-3 h-3 text-neutral-500" />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)}></div>
              
              <div className="absolute right-0 mt-2 w-52 bg-[#121212] border border-neutral-800 rounded-xl shadow-2xl p-1 z-20">
                
                {/* Option 1 : Markdown */}
                <button 
                  onClick={() => { onExport('md'); setDropdownOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800 rounded-lg transition-all flex items-center gap-3"
                >
                  <FileText className="w-4 h-4 text-neutral-500 shrink-0" />
                  <span>Fichier Markdown (.md)</span>
                </button>
                
                {/* Option 2 : HTML */}
                <button 
                  onClick={() => { onExport('html'); setDropdownOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800 rounded-lg transition-all flex items-center gap-3"
                >
                  <FileCode className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Page Web (.html)</span>
                </button>
                
                {/* Option 3 : PDF */}
                <button 
                  onClick={() => { onExport('pdf'); setDropdownOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800 rounded-lg transition-all flex items-center gap-3"
                >
                  <FileText className="w-4 h-4 text-red-500 shrink-0" />
                  <span>Document PDF (.pdf)</span>
                </button>

              </div>
            </>
          )}
        </div>

        {/* SAUVEGARDE BDD */}
        <button onClick={onSave} className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg active:scale-95">
          <Save className="w-4 h-4" />
          <span>Enregistrer</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;