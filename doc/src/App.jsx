import React, { useState } from 'react';
import './App.css';

// ==========================================
// 1. LE COMPOSANT DE BLOC DE CODE COPIABLE
// ==========================================
const CodeBlock = ({ content }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Rétroaction de 2 secondes
    } catch (err) {
      console.error("Échec de la copie : ", err);
    }
  };

  return (
    <div className="my-3 flex items-center justify-between rounded-xl bg-[#121212] border border-neutral-800 p-4 font-mono text-sm text-neutral-200 shadow-lg">
      <code className="break-all pr-4">{content}</code>
      <button
        onClick={handleCopy}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
          copied
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700 hover:text-neutral-200'
        }`}
      >
        {copied ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Copié
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copier
          </>
        )}
      </button>
    </div>
  );
};

// ==========================================
// 2. LE MOTEUR DE RENDU (INTERPRÉTEUR)
// ==========================================
const DocRenderer = ({ rawText }) => {
  if (!rawText) return <p className="text-neutral-500 italic">L'aperçu s'affichera ici...</p>;

  const lines = rawText.split('\n');

  return (
    <div className="space-y-3 text-neutral-300">
      {lines.map((line, index) => {
        const trimmedLine = line.trim();

        // Règle # : Texte en gras / Titre
        if (trimmedLine.startsWith('#')) {
          return (
            <p key={index} className="text-xl font-bold text-white mt-4">
              {trimmedLine.substring(1).trim()}
            </p>
          );
        }

        // Règle src="" : Image
        if (trimmedLine.startsWith('src="')) {
          const match = trimmedLine.match(/"([^"]+)"/);
          const src = match ? match[1] : '';
          
          return src ? (
            <div key={index} className="my-4 overflow-hidden rounded-lg border border-neutral-800">
              <img src={src} alt="Documentation" className="h-auto w-full object-cover" />
            </div>
          ) : null;
        }

        // Règle $ : Bloc de code copiable
        if (trimmedLine.startsWith('$')) {
          return <CodeBlock key={index} content={trimmedLine.substring(1).trim()} />;
        }

        // Saut de ligne vide
        if (trimmedLine === '') return <div key={index} className="h-2" />;
        
        // Texte normal par défaut
        return <p key={index} className="leading-relaxed text-neutral-400">{line}</p>;
      })}
    </div>
  );
};

// ==========================================
// 3. LE COMPOSANT PRINCIPAL (INTERFACE)
// ==========================================
export default function App() {
  // Texte initial pour faire une démo directe dans ton appli
  const [text, setText] = useState(
    '# Bienvenue sur ton interpréteur\n\n' +
    'Voici une ligne de texte normale.\n\n' +
    '$ npm run dev\n\n' +
    'Et voici une image en dessous :\n' +
    'src="https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=600"'
  );

  return (
    <div className="min-h-screen bg-[#0b0b0c] text-white p-6 font-sans">
      {/* Barre supérieure */}
      <header className="mb-6 border-b border-neutral-800 pb-4 flex justify-between items-center">
        <h1 className="text-lg font-semibold tracking-tight text-neutral-200">
          DocInterpreter <span className="text-xs bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded ml-2">v1.0</span>
        </h1>
      </header>

      {/* Grille principale (Éditeur à gauche, Rendu à droite) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-120px)]">
        
        {/* Zone de saisie */}
        <div className="flex flex-col">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">Éditeur (.txt)</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full flex-1 resize-none rounded-xl bg-[#121212] border border-neutral-800 p-4 font-mono text-sm text-neutral-300 focus:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-700 transition-all"
            placeholder="Écris ton code ici... \n# pour le gras\n$ pour le code\nsrc='url' pour l'image"
          />
        </div>

        {/* Zone d'affichage */}
        <div className="flex flex-col">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">Rendu visuel</label>
          <div className="w-full flex-1 overflow-y-auto rounded-xl bg-[#121212]/40 border border-neutral-800 p-6 backdrop-blur-sm">
            <DocRenderer rawText={text} />
          </div>
        </div>

      </div>
    </div>
  );
}