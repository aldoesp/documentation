import React from 'react';

const Sidebar = ({ documents, selectedId, onSelectDoc, onNewDoc }) => {
  return (
    <aside className="w-64 bg-[#121212] border-r border-neutral-800 p-4 flex flex-col justify-between h-screen">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-4 px-2">
          Mes Documents
        </h2>
        <div className="space-y-1 overflow-y-auto max-h-[75vh]">
          {documents && documents.length > 0 ? (
            documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => onSelectDoc(doc.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all truncate block ${
                  selectedId === doc.id 
                    ? 'bg-neutral-800 text-white font-medium shadow-inner' 
                    : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200'
                }`}
              >
                📄 {doc.titre}
              </button>
            ))
          ) : (
            <p className="text-xs text-neutral-600 italic px-2">Aucun document trouvé</p>
          )}
        </div>
      </div>

      <button
        onClick={onNewDoc}
        className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm py-3 px-4 rounded-xl border border-neutral-700 font-medium transition-all mt-4"
      >
        + Nouveau Document
      </button>
    </aside>
  );
};

export default Sidebar;