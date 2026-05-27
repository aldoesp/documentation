import React from 'react';
import CodeBlock from './CodeBlock';

const DocRenderer = ({ rawText }) => {
  if (!rawText || rawText.trim() === '') {
    return <p className="text-neutral-500 italic">L'aperçu en temps réel s'affichera ici...</p>;
  }

  const lines = rawText.split('\n');

  return (
    <div className="space-y-3 text-neutral-300">
      {lines.map((line, index) => {
        const trimmedLine = line.trim();

        // 1. Titre (Commence par #)
        if (trimmedLine.startsWith('#')) {
          return (
            <p key={index} className="text-xl font-bold text-white mt-6 mb-2 border-b border-neutral-800 pb-1">
              {trimmedLine.substring(1).trim()}
            </p>
          );
        }

        // 2. Image (Commence par src=")
        if (trimmedLine.startsWith('src="')) {
          const src = trimmedLine.match(/"([^"]+)"/)?.[1];
          return src ? (
            <div key={index} className="my-4 rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900">
              <img src={src} alt="Documentation Visual" className="w-full h-auto object-cover" />
            </div>
          ) : null;
        }

        // 3. Bloc de commande / Code (Commence par $)
        if (trimmedLine.startsWith('$')) {
          return <CodeBlock key={index} content={trimmedLine.substring(1).trim()} />;
        }

        // 4. Ligne vide (Saut de ligne)
        if (trimmedLine === '') {
          return <div key={index} className="h-3" />;
        }

        // 5. Texte normal
        return <p key={index} className="text-neutral-400 leading-relaxed">{line}</p>;
      })}
    </div>
  );
};

export default DocRenderer;