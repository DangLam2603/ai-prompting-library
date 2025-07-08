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

  useEffect(() => {
    fetchPrompts().then((data) => {
      setPrompts(data);
      setRoles(Array.from(new Set(data.map((p) => p.role))));
    });
  }, []);

  // Sidebar injection
  useEffect(() => {
    const sidebar = document.querySelector(".sidebar");
    if (sidebar) {
      sidebar.innerHTML =
        `<div class='sidebar-title'>Prompt Library</div>` +
        roles
          .map(
            (role) =>
              `<button class='sidebar-role${
                selectedRole === role ? " selected" : ""
              }' data-role='${role}'>${role}</button>`
          )
          .join("");
      sidebar.querySelectorAll(".sidebar-role").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const role = (e.target as HTMLElement).getAttribute("data-role");
          setSelectedRole(role);
        });
      });
    }
  }, [roles, selectedRole]);

  const filteredPrompts = selectedRole
    ? prompts.filter((p) => p.role === selectedRole)
    : [];

  return (
    <>
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
          style={{ fontWeight: 800, fontSize: "2.2rem", letterSpacing: "-1px" }}
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
    </>
  );
}
