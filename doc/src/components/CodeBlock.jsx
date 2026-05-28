import React, { useState } from 'react';

const CodeBlock = ({ content }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Impossible de copier le texte : ", err);
    }
  };

  return (
    <div className="my-3 flex items-center justify-between rounded-xl bg-[#121212] border border-neutral-800 p-4 font-mono text-sm text-neutral-200 shadow-inner">
      <code className="break-all select-all">{content}</code>
      <button 
        onClick={handleCopy} 
        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 shrink-0 ml-4 ${
          copied 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
            : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200 border border-neutral-700/50'
        }`}
      >
        {copied ? 'Copié !' : 'Copier'}
      </button>
    </div>
  );
};

export default CodeBlock;