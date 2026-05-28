import React, { useRef } from 'react';
// Importation des icônes dont on a besoin
import { 
  SquarePen, 
  Columns, 
  Eye, 
  PanelLeftClose, 
  PanelLeftOpen, 
  Image, 
  Save 
} from 'lucide-react';

const Navbar = ({ titre, setTitre, onSave, onImageImport, showSidebar, setShowSidebar, viewMode, setViewMode }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onImageImport(e.target.files[0]);
      e.target.value = ""; 
    }
  };

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
          <button 
            onClick={() => setViewMode('editor')}
            title="Saisie uniquement"
            className={`p-2 rounded-lg transition-all ${viewMode === 'editor' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-500 hover:text-neutral-300'}`}
          >
            <SquarePen className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewMode('split')}
            title="Écran scindé"
            className={`p-2 rounded-lg transition-all ${viewMode === 'split' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-500 hover:text-neutral-300'}`}
          >
            <Columns className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewMode('preview')}
            title="Aperçu uniquement"
            className={`p-2 rounded-lg transition-all ${viewMode === 'preview' ? 'bg-neutral-800 text-white shadow' : 'text-neutral-500 hover:text-neutral-300'}`}
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Bouton Menu Latéral Dynamique */}
        <button 
          onClick={() => setShowSidebar(!showSidebar)}
          title={showSidebar ? "Masquer le menu" : "Afficher le menu"}
          className={`p-2 rounded-xl border transition-all flex items-center justify-center ${
            showSidebar 
              ? 'bg-neutral-800 border-neutral-700 text-white' 
              : 'bg-transparent border-neutral-800 text-neutral-400 hover:bg-[#121212]'
          }`}
        >
          {showSidebar ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
        </button>

        <div className="w-px h-6 bg-neutral-800 mx-1"></div>

        {/* Actions (Import et Sauvegarde) */}
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        
        <button 
          onClick={() => fileInputRef.current.click()} 
          className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm px-4 py-2.5 rounded-xl font-medium border border-neutral-700 transition-all flex items-center gap-2"
        >
          <Image className="w-4 h-4 text-neutral-400" />
          <span>Image</span>
        </button>

        <button 
          onClick={onSave} 
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/20 active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>Enregistrer</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;