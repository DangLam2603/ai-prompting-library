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
      className="card"
      onClick={onClick}
      style={{ margin: "1.2rem", cursor: "pointer" }}
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
      <h3
        style={{ margin: "0 0 0.5em 0", fontWeight: 700, fontSize: "1.25rem" }}
      >
        {prompt.title}
      </h3>
      <div
        style={{
          color: "#6b7280",
          fontSize: "1rem",
          marginBottom: "1.2em",
          flex: 1,
        }}
      >
        {prompt.prompt.length > 120
          ? prompt.prompt.slice(0, 120) + "…"
          : prompt.prompt}
      </div>
      <div style={{ display: "flex", alignItems: "center", marginTop: "auto" }}>
        <span className="badge">{prompt.role}</span>
        {prompt.author && <span className="badge">@{prompt.author}</span>}
      </div>
    </div>
  );
};

export default PromptCard;
