import React from 'react';

const Navbar = ({ titre, setTitre, onSave }) => {
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
      <button
        onClick={onSave}
        className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
      >
        Enregistrer dans la BDD
      </button>
    </header>
  );
};

export default Navbar;