import React, { useState, useEffect } from "react";
import { Prompt } from "../components/PromptCard";

interface PromptModalProps {
  open: boolean;
  prompt: Prompt | null;
  onClose: () => void;
}

type Variable = { key: string; label: string; defaultValue: string };

function extractVariables(template: string): Variable[] {
  const regex = /\$\{([^:}]+):([^}]+)\}/g;
  const vars: Variable[] = [];
  let match;
  while ((match = regex.exec(template))) {
    vars.push({ key: match[1], label: match[1], defaultValue: match[2] });
  }
  return vars;
}

function fillTemplateWithBold(
  template: string,
  values: Record<string, string>
) {
  const regex = /\$\{([^:}]+):([^}]+)\}/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(template))) {
    if (match.index > lastIndex) {
      parts.push(template.slice(lastIndex, match.index));
    }
    const key = match[1];
    const def = match[2];
    const value = values[key] ?? def;
    parts.push(
      <b key={match.index} style={{ color: "#38bdf8", fontWeight: 700 }}>
        {value}
      </b>
    );
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < template.length) {
    parts.push(template.slice(lastIndex));
  }
  return parts;
}

const PromptModal: React.FC<PromptModalProps> = ({ open, prompt, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [variables, setVariables] = useState<Variable[]>([]);

  useEffect(() => {
    if (prompt) {
      const vars = extractVariables(prompt.prompt);
      setVariables(vars);
      setCustomValues(
        Object.fromEntries(vars.map((v) => [v.key, v.defaultValue]))
      );
    }
  }, [prompt]);

  if (!open || !prompt) return null;

  const customizedPrompt =
    variables.length > 0
      ? fillTemplateWithBold(prompt.prompt, customValues)
      : prompt.prompt;

  const handleCopy = async () => {
    const plainPrompt = prompt.prompt.replace(
      /\$\{([^:}]+):([^}]+)\}/g,
      (_, key, def) => customValues[key] ?? def
    );
    await navigator.clipboard.writeText(plainPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Side-by-side for customizable prompts, single column for static prompts
  return (
    <div
      className={variables.length > 0 ? "modal-customizable" : "modal-static"}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      {variables.length > 0 ? (
        <div
          className="card modal-customizable-inner"
          style={{
            maxWidth: 900,
            width: "95%",
            position: "relative",
            background: "#292c36",
            display: "flex",
            flexDirection: "row",
            gap: 0,
            padding: 0,
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: "none",
              border: "none",
              color: "#6b7280",
              fontSize: 24,
              cursor: "pointer",
              zIndex: 2,
            }}
          >
            &times;
          </button>
          {/* Left: Input Panel */}
          <div
            style={{
              flex: 1,
              minWidth: 320,
              maxWidth: 400,
              background: "#292c36",
              padding: "2rem 1.5rem 1.5rem 1.5rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
            }}
          >
            <h2 style={{ marginTop: 0, color: "#38bdf8" }}>{prompt.title}</h2>
            <div style={{ marginBottom: "1.2rem", marginTop: "1.2rem" }}>
              {variables.map((v) => (
                <div key={v.key} style={{ marginBottom: "0.7rem" }}>
                  <label
                    style={{
                      color: "#a1a1aa",
                      fontWeight: 500,
                      marginRight: 8,
                    }}
                  >
                    {v.key}:
                  </label>
                  <input
                    style={{
                      background: "#23262f",
                      color: "#f3f4f6",
                      border: "1px solid #31343c",
                      borderRadius: 6,
                      padding: "0.4em 0.8em",
                      fontSize: "1rem",
                      width: "90%",
                    }}
                    value={customValues[v.key] ?? v.defaultValue}
                    onChange={(e) =>
                      setCustomValues((cv) => ({
                        ...cv,
                        [v.key]: e.target.value,
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>
          {/* Divider */}
          <div style={{ width: 1, background: "#23262f", margin: "2rem 0" }} />
          {/* Right: Prompt Preview Panel */}
          <div
            style={{
              flex: 1.3,
              minWidth: 320,
              maxWidth: 500,
              background: "#23262f",
              padding: "2rem 1.5rem 1.5rem 1.5rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
            }}
          >
            <h2 style={{ marginTop: 0, color: "#38bdf8" }}>
              {prompt.title}{" "}
              <span
                style={{ fontWeight: 400, fontSize: "1rem", color: "#a1a1aa" }}
              >
                (Preview)
              </span>
            </h2>
            <div
              style={{
                margin: "1.2rem 0",
                whiteSpace: "pre-wrap",
                color: "#f3f4f6",
                fontSize: "1.1rem",
                background: "#22252c",
                borderRadius: 8,
                padding: 12,
                maxHeight: 300,
                overflowY: "auto",
                wordBreak: "break-word",
              }}
            >
              {customizedPrompt}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "1.2rem",
              }}
            >
              <span className="badge">{prompt.role}</span>
              {prompt.author && <span className="badge">@{prompt.author}</span>}
            </div>
            <button
              onClick={handleCopy}
              className="copy-btn"
              style={{ position: "static", marginTop: "0.5rem", width: "100%" }}
            >
              {copied ? "Copied!" : "Copy Customized Prompt"}
            </button>
          </div>
        </div>
      ) : (
        <div
          className="card modal-static-inner"
          style={{
            maxWidth: 700,
            minWidth: 320,
            position: "relative",
            background: "#23262f",
            padding: "2rem 1.5rem 1.5rem 1.5rem",
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: "none",
              border: "none",
              color: "#6b7280",
              fontSize: 24,
              cursor: "pointer",
            }}
          >
            &times;
          </button>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "1.2rem",
            }}
          >
            <span
              style={{
                color: "#38bdf8",
                fontWeight: 700,
                fontSize: "1.2rem",
                marginRight: 8,
              }}
            >
              {prompt.title}
            </span>
            <span
              style={{ color: "#a1a1aa", fontWeight: 400, fontSize: "1rem" }}
            >
              (Preview)
            </span>
          </div>
          <div
            style={{
              margin: "1.2rem 0",
              whiteSpace: "pre-wrap",
              color: "#f3f4f6",
              fontSize: "1.1rem",
              background: "#22252c",
              borderRadius: 8,
              padding: 12,
              wordBreak: "break-word",
            }}
          >
            {customizedPrompt}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "1.2rem",
            }}
          >
            <span className="badge">{prompt.role}</span>
            {prompt.author && <span className="badge">@{prompt.author}</span>}
          </div>
          <button
            onClick={handleCopy}
            className="copy-btn"
            style={{ position: "static", marginTop: "0.5rem", width: "100%" }}
          >
            {copied ? "Copied!" : "Copy Prompt"}
          </button>
        </div>
      )}
      <style>{`
        @media (max-width: 800px) {
          .modal-customizable-inner {
            flex-direction: column !important;
            max-width: 98vw !important;
            min-width: 0 !important;
          }
          .modal-customizable-inner > div {
            max-width: 100% !important;
            min-width: 0 !important;
            padding: 1.2rem 1rem 1rem 1rem !important;
          }
          .modal-customizable-inner > div[style*='width: 1px'] {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PromptModal;
