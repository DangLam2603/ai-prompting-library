import React from "react";

interface RoleSelectorProps {
  roles: string[];
  selectedRole: string | null;
  onSelect: (role: string) => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({
  roles,
  selectedRole,
  onSelect,
}) => {
  return (
    <div className="role-selector">
      {roles.map((role) => (
        <button
          key={role}
          className={`role-pill${selectedRole === role ? " selected" : ""}`}
          onClick={() => onSelect(role)}
          aria-pressed={selectedRole === role}
        >
          {role}
        </button>
      ))}
    </div>
  );
};

export default RoleSelector;
