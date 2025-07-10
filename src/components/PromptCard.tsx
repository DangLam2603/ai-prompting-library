import React from "react";

export interface Prompt {
  role: string;
  title: string;
  prompt: string;
  author?: string;
}

interface PromptCardProps {
  prompt: Prompt;
  onClick: () => void;
}

const PromptCard: React.FC<PromptCardProps> = ({ prompt, onClick }) => {
  return (
    <div
      className="card responsive-card"
      onClick={onClick}
      style={{ cursor: "pointer" }}
    >
      <button
        className="copy-btn"
        title="Copy prompt"
        onClick={(e) => {
          e.stopPropagation();
          navigator.clipboard.writeText(prompt.prompt);
        }}
      >
        📋
      </button>
      <h3 className="prompt-title">{prompt.title}</h3>
      <div className="prompt-content">
        {prompt.prompt.length > 120
          ? prompt.prompt.slice(0, 120) + "…"
          : prompt.prompt}
      </div>
      <div
        className="prompt-footer"
        style={{ marginTop: "1rem", display: "flex", alignItems: "center" }}
      >
        <span className="badge">{prompt.role}</span>
        {prompt.author && <span className="badge">@{prompt.author}</span>}
      </div>
    </div>
  );
};

export default PromptCard;
