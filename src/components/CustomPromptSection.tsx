import React, { useEffect, useState } from "react";
import Papa from "papaparse";

const CONCEPTS = ["Persona", "Task", "Context", "Format", "Example", "Tone"];

interface ConceptExample {
  concept: string;
  example: string;
}

const fetchConceptExamples = async (): Promise<ConceptExample[]> => {
  const res = await fetch("/concept_examples.csv");
  const csvText = await res.text();
  const { data } = Papa.parse<ConceptExample>(csvText, {
    header: true,
    skipEmptyLines: true,
  });
  return data as ConceptExample[];
};

const buildPrompt = (concepts: string[], values: Record<string, string>) => {
  let prompt = "";
  if (concepts.includes("Persona")) prompt += `${values["Persona"]}. `;
  if (concepts.includes("Task")) prompt += `${values["Task"]}`;
  if (concepts.includes("Context")) prompt += ` ${values["Context"]}`;
  if (concepts.includes("Format")) prompt += ` ${values["Format"]}`;
  if (concepts.includes("Tone")) prompt += ` ${values["Tone"]}`;
  if (concepts.includes("Example")) prompt += `\n\n${values["Example"]}`;
  return prompt.trim();
};

const CONCEPT_COLORS: Record<string, string> = {
  Persona: "#38bdf8", // blue
  Task: "#34d399", // green
  Context: "#fbbf24", // yellow
  Format: "#f472b6", // pink
  Example: "#a78bfa", // purple
  Tone: "#f87171", // red
};

function buildPromptParts(concepts: string[], values: Record<string, string>) {
  const parts: { concept: string; text: string }[] = [];
  if (concepts.includes("Persona"))
    parts.push({ concept: "Persona", text: (values["Persona"] || "") + ". " });
  if (concepts.includes("Task"))
    parts.push({ concept: "Task", text: values["Task"] || "" });
  if (concepts.includes("Context"))
    parts.push({ concept: "Context", text: " " + (values["Context"] || "") });
  if (concepts.includes("Format"))
    parts.push({ concept: "Format", text: " " + (values["Format"] || "") });
  if (concepts.includes("Tone"))
    parts.push({ concept: "Tone", text: " " + (values["Tone"] || "") });
  if (concepts.includes("Example"))
    parts.push({
      concept: "Example",
      text: "\n\n" + (values["Example"] || ""),
    });
  return parts;
}

const CustomPromptSection: React.FC = () => {
  const [conceptExamples, setConceptExamples] = useState<ConceptExample[]>([]);
  const [selectedConcepts, setSelectedConcepts] = useState<string[]>([
    "Persona",
    "Task",
    "Context",
    "Format",
  ]);
  const [conceptValues, setConceptValues] = useState<Record<string, string>>(
    {}
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchConceptExamples().then((examples) => {
      setConceptExamples(examples);
      // Set default values for each concept
      const defaults: Record<string, string> = {};
      CONCEPTS.forEach((c) => {
        const ex = examples.find((e) => e.concept === c);
        if (ex) defaults[c] = ex.example;
      });
      setConceptValues(defaults);
    });
  }, []);

  const handleConceptToggle = (concept: string) => {
    setSelectedConcepts((prev) =>
      prev.includes(concept)
        ? prev.filter((c) => c !== concept)
        : [...prev, concept]
    );
  };

  const handleValueChange = (concept: string, value: string) => {
    setConceptValues((prev) => ({ ...prev, [concept]: value }));
  };

  const getExamplesForConcept = (concept: string) =>
    conceptExamples.filter((e) => e.concept === concept);

  const customizedPrompt = buildPrompt(selectedConcepts, conceptValues);
  const promptParts = buildPromptParts(selectedConcepts, conceptValues);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(customizedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section
      className="custom-prompt-section card"
      style={{
        maxWidth: 1100,
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
      {/* Left: Concept Selector & Inputs */}
      <div
        style={{
          flex: 1,
          minWidth: 320,
          maxWidth: 400,
          background: "#292c36",
          padding: "1.5rem 1.5rem 1.5rem 1.5rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
        }}
      >
        <h2 style={{ marginTop: 0, color: "#38bdf8" }}>
          Custom Prompt Builder
        </h2>
        <div style={{ marginBottom: "1.2rem", marginTop: "1.2rem" }}>
          <div style={{ marginBottom: "1.2rem" }}>
            <strong style={{ color: "#a1a1aa" }}>Select Concepts:</strong>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5em",
                marginTop: 8,
              }}
            >
              {CONCEPTS.map((concept) => (
                <label
                  key={concept}
                  style={{ color: "#a1a1aa", fontWeight: 500 }}
                >
                  <input
                    type="checkbox"
                    checked={selectedConcepts.includes(concept)}
                    onChange={() => handleConceptToggle(concept)}
                    style={{ marginRight: 4 }}
                  />
                  {concept}
                </label>
              ))}
            </div>
          </div>
          {selectedConcepts.map((concept) => {
            const examples = getExamplesForConcept(concept);
            const isTextarea =
              concept === "Example" ||
              concept === "Task" ||
              concept === "Context";
            const currentValue = conceptValues[concept] || "";
            // Find if current value matches an example
            const matchIdx = examples.findIndex(
              (ex) => ex.example === currentValue
            );
            return (
              <div key={concept} style={{ marginBottom: "0.7rem" }}>
                <label
                  style={{
                    color: "#a1a1aa",
                    fontWeight: 500,
                    marginRight: 8,
                  }}
                >
                  {concept}:
                </label>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 4 }}
                >
                  <select
                    style={{
                      background: "#23262f",
                      color: "#f3f4f6",
                      border: "1px solid #31343c",
                      borderRadius: 6,
                      padding: "0.4em 0.8em",
                      fontSize: "1rem",
                      width: "100%",
                      marginBottom: 4,
                    }}
                    value={
                      matchIdx === -1
                        ? "__custom__"
                        : examples[matchIdx].example
                    }
                    onChange={(e) => {
                      if (e.target.value === "__custom__") return;
                      handleValueChange(concept, e.target.value);
                    }}
                  >
                    {examples.map((ex, idx) => (
                      <option key={idx} value={ex.example}>
                        {ex.example}
                      </option>
                    ))}
                    <option value="__custom__">Custom</option>
                  </select>
                  {isTextarea ? (
                    <textarea
                      style={{
                        background: "#23262f",
                        color: "#f3f4f6",
                        border: "1px solid #31343c",
                        borderRadius: 6,
                        padding: "0.4em 0.8em",
                        fontSize: "1rem",
                        width: "100%",
                        minHeight: 60,
                        resize: "vertical",
                      }}
                      value={currentValue}
                      onChange={(e) =>
                        handleValueChange(concept, e.target.value)
                      }
                    />
                  ) : (
                    <input
                      style={{
                        background: "#23262f",
                        color: "#f3f4f6",
                        border: "1px solid #31343c",
                        borderRadius: 6,
                        padding: "0.4em 0.8em",
                        fontSize: "1rem",
                        width: "100%",
                      }}
                      value={currentValue}
                      onChange={(e) =>
                        handleValueChange(concept, e.target.value)
                      }
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Divider */}
      <div style={{ width: 1, background: "#23262f", margin: "2rem 0" }} />
      {/* Right: Prompt Preview Panel */}
      <div
        style={{
          flex: 1.3,

          background: "#23262f",
          padding: "2rem 1.5rem 1.5rem 1.5rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
        }}
      >
        <h2 style={{ marginTop: 0, color: "#38bdf8" }}>
          Custom Prompt{" "}
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

            overflowY: "auto",
            wordBreak: "break-word",
          }}
        >
          {promptParts.map((part, idx) => (
            <span
              key={part.concept + idx}
              style={{
                color: CONCEPT_COLORS[part.concept] || "#f3f4f6",
                fontWeight: 500,
              }}
            >
              {part.text}
            </span>
          ))}
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
