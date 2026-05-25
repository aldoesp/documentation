const DocRenderer = ({ rawText }) => {
  if (!rawText) return <p className="text-neutral-500 italic">L'aperçu s'affichera ici...</p>;

  const lines = rawText.split('\n');

  return (
    <div className="space-y-3 text-neutral-300">
      {lines.map((line, index) => {
        const trimmedLine = line.trim();

        // Règle 1 : Gras (commence par #)
        if (trimmedLine.startsWith('#')) {
          return (
            <p key={index} className="text-lg font-bold text-white mt-4">
              {trimmedLine.substring(1).trim()}
            </p>
          );
        }

        // Règle 2 : Image (commence par src="")
        if (trimmedLine.startsWith('src="')) {
          // Extraction propre de l'URL entre les guillemets
          const match = trimmedLine.match(/"([^"]+)"/);
          const src = match ? match[1] : '';
          
          return src ? (
            <div key={index} className="my-4 overflow-hidden rounded-lg border border-neutral-800">
              <img src={src} alt="Documentation" className="h-auto w-full object-cover" />
            </div>
          ) : null;
        }

        // Règle 3 : Bloc de code copiable (commence par $)
        if (trimmedLine.startsWith('$')) {
          return <CodeBlock key={index} content={trimmedLine.substring(1).trim()} />;
        }

        // Par défaut : Ligne vide ou texte normal
        if (trimmedLine === '') return <div key={index} className="h-2" />;
        
        return <p key={index} className="leading-relaxed">{line}</p>;
      })}
    </div>
  );
};