import React, { useRef } from 'react';
import { 
  SquarePen, 
  Columns, 
  Eye, 
  PanelLeftClose, 
  PanelLeftOpen, 
  Image, 
  FileUp, // <-- Nouvelle icône pour l'import de doc
  Save 
} from 'lucide-react';

const Navbar = ({ titre, setTitre, onSave, onImageImport, onDocumentImport, showSidebar, setShowSidebar, viewMode, setViewMode }) => {
  const imageInputRef = useRef(null);
  const docInputRef = useRef(null); // <-- Référence pour le sélecteur de doc

  return (
    <header className="mb-6 flex gap-4 items-center justify-between bg-[#0b0b0c] py-2">
      
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
      <div className="flex items-center gap-3">
        
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

        {/* Inputs cachés */}
        <input type="file" ref={imageInputRef} onChange={(e) => e.target.files[0] && onImageImport(e.target.files[0])} accept="image/*" className="hidden" />
        <input type="file" ref={docInputRef} onChange={(e) => e.target.files[0] && onDocumentImport(e.target.files[0])} accept=".txt,.pdf,.docx" className="hidden" />
        
        {/* BOUTON IMPORT IMAGE */}
        <button onClick={() => imageInputRef.current.click()} className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm px-4 py-2.5 rounded-xl font-medium border border-neutral-700 transition-all flex items-center gap-2">
          <Image className="w-4 h-4 text-neutral-400" />
          <span>Image</span>
        </button>

        {/* NOUVEAU BOUTON IMPORT DOCUMENT */}
        <button onClick={() => docInputRef.current.click()} className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm px-4 py-2.5 rounded-xl font-medium border border-neutral-700 transition-all flex items-center gap-2">
          <FileUp className="w-4 h-4 text-neutral-400" />
          <span>Doc</span>
        </button>

        {/* SAUVEGARDE */}
        <button onClick={onSave} className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg active:scale-95">
          <Save className="w-4 h-4" />
          <span>Enregistrer</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;