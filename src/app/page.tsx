"use client";
import React, { useEffect, useState } from "react";
import PromptCard, { Prompt } from "../components/PromptCard";
import PromptModal from "../../src/components/PromptModal";
import { fetchPrompts } from "../components/csvParser";

export default function Home() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [modalPrompt, setModalPrompt] = useState<Prompt | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [roleSearch, setRoleSearch] = useState("");

  useEffect(() => {
    fetchPrompts().then((data) => {
      setPrompts(data);
      setRoles(Array.from(new Set(data.map((p) => p.role))));
    });
  }, []);

  const filteredRoles = roles.filter((role) =>
    role.toLowerCase().includes(roleSearch.toLowerCase())
  );

  const filteredPrompts = selectedRole
    ? prompts.filter((p) => p.role === selectedRole)
    : [];

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-title">Prompt Library</div>
        <input
          className="sidebar-role-search"
          placeholder="Search roles..."
          style={{
            width: "100%",
            marginBottom: "1rem",
            padding: "0.5em 0.8em",
            borderRadius: 7,
            border: "1px solid #31343c",
            background: "#23262f",
            color: "#f3f4f6",
            fontSize: "1rem",
            outline: "none",
          }}
          value={roleSearch}
          onChange={(e) => setRoleSearch(e.target.value)}
        />
        <div className="sidebar-role-list">
          {filteredRoles.map((role) => (
            <button
              key={role}
              className={
                "sidebar-role" + (selectedRole === role ? " selected" : "")
              }
              onClick={() => setSelectedRole(role)}
            >
              {role}
            </button>
          ))}
        </div>
      </aside>
      <main className="main-content">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h1
            className="text-accent"
            style={{
              fontWeight: 800,
              fontSize: "2.2rem",
              letterSpacing: "-1px",
            }}
          >
            {selectedRole ? selectedRole : "Select a Role"}
          </h1>
        </div>
        <div className="card-grid">
          {filteredPrompts.map((prompt, idx) => (
            <PromptCard
              key={idx}
              prompt={prompt}
              onClick={() => {
                setModalPrompt(prompt);
                setModalOpen(true);
              }}
            />
          ))}
        </div>
        <PromptModal
          open={modalOpen}
          prompt={modalPrompt}
          onClose={() => setModalOpen(false)}
        />
      </main>
    </div>
  );
}
