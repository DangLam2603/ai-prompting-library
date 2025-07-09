import React, { useEffect, useState } from "react";
import Papa from "papaparse";

interface BasePrompt {
  role: string;
  title: string;
  prompt: string;
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

const fetchBasePrompt = async (): Promise<BasePrompt | null> => {
  const res = await fetch("/base_prompts.csv");
  const csvText = await res.text();
  const { data } = Papa.parse<BasePrompt>(csvText, {
    header: true,
    skipEmptyLines: true,
  });
  return data[0] || null;
};

const CustomPromptSection: React.FC = () => {
  const [basePrompt, setBasePrompt] = useState<BasePrompt | null>(null);
  const [variables, setVariables] = useState<Variable[]>([]);
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchBasePrompt().then((prompt) => {
      setBasePrompt(prompt);
      if (prompt) {
        const vars = extractVariables(prompt.prompt);
        setVariables(vars);
        setCustomValues(
          Object.fromEntries(vars.map((v) => [v.key, v.defaultValue]))
        );
      }
    });
  }, []);

  if (!basePrompt) return null;

  const customizedPrompt =
    variables.length > 0
      ? fillTemplateWithBold(basePrompt.prompt, customValues)
      : basePrompt.prompt;

  const handleCopy = async () => {
    const plainPrompt = basePrompt.prompt.replace(
      /\$\{([^:}]+):([^}]+)\}/g,
      (_, key, def) => customValues[key] ?? def
    );
    await navigator.clipboard.writeText(plainPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section
      className="custom-prompt-section card"
      style={{
        maxWidth: 900,
        width: "100%",
        margin: "2rem auto 2.5rem auto",
        background: "#292c36",
        display: "flex",
        flexDirection: "row",
        gap: 0,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 2px 16px 0 #0002",
      }}
    >
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
          justifyContent: "space-between",
        }}
      >
        <h2 style={{ marginTop: 0, color: "#38bdf8" }}>{basePrompt.title}</h2>
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
          justifyContent: "space-between",
        }}
      >
        <h2 style={{ marginTop: 0, color: "#38bdf8" }}>
          {basePrompt.title}{" "}
          <span style={{ fontWeight: 400, fontSize: "1rem", color: "#a1a1aa" }}>
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
        <button
          onClick={handleCopy}
          className="copy-btn"
          style={{ position: "static", marginTop: "0.5rem", width: "100%" }}
        >
          {copied ? "Copied!" : "Copy Customized Prompt"}
        </button>
      </div>
    </section>
  );
};

export default CustomPromptSection;
