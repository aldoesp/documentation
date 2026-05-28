import React, { useRef } from 'react';

const Navbar = ({ titre, setTitre, onSave, onImageImport }) => {
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    // Déclenche le clic sur le input de fichier caché
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onImageImport(e.target.files[0]);
      // Réinitialise la valeur pour pouvoir ré-importer la même image si besoin
      e.target.value = ""; 
    }
  };

  return (
    <header className="mb-6 flex gap-4 items-center bg-[#0b0b0c] py-2">
      <div className="relative flex-1 max-w-sm">
        <input
          type="text"
          placeholder="Titre du document..."
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          className="w-full bg-[#121212] border border-neutral-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-neutral-600 text-white transition-all"
        />
      </div>

      <div className="flex gap-2">
        {/* Input Fichier Caché */}
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden" 
        />

        {/* Bouton Importer Image visible */}
        <button
          onClick={handleButtonClick}
          className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm px-4 py-2.5 rounded-xl font-medium border border-neutral-700 transition-all active:scale-95"
        >
          🖼️ Importer Image
        </button>

        {/* Bouton Sauvegarder */}
        <button
          onClick={onSave}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
        >
          Sauvegarder
        </button>
      </div>
    </header>
  );
};

export default Navbar;