"use client";

import { useState, type KeyboardEvent } from "react";

type TagInputProps = {
  id: string;
  value: string[];
  onChange: (tags: string[]) => void;
  onBlur?: () => void;
  max?: number;
  invalid?: boolean;
  describedBy?: string;
  placeholder?: string;
};

export function TagInput({ id, value, onChange, onBlur, max = 8, invalid, describedBy, placeholder }: TagInputProps) {
  const [draft, setDraft] = useState("");

  function normalise(raw: string) {
    return raw.trim().toLowerCase().replace(/\s+/g, "-");
  }

  function commit(raw: string) {
    commitMany([raw]);
    setDraft("");
  }

  function commitMany(parts: string[]) {
    const next = [...value];
    for (const part of parts) {
      const tag = normalise(part);
      if (tag && !next.includes(tag) && next.length < max) next.push(tag);
    }
    if (next.length !== value.length) onChange(next);
  }

  // Typing or pasting "a, b, c": everything before the last comma becomes tags.
  function handleChange(text: string) {
    if (!text.includes(",")) {
      setDraft(text);
      return;
    }
    const parts = text.split(",");
    setDraft(parts.pop() ?? "");
    commitMany(parts);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      commit(draft);
    } else if (event.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div
      className={`flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-lg border bg-surface px-2 py-1.5 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/25 ${
        invalid ? "border-danger" : "border-line"
      }`}
    >
      {value.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-accent-soft py-0.5 pl-2 pr-1 text-xs font-semibold text-accent">
          #{tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((t) => t !== tag))}
            className="grid size-4 place-items-center rounded hover:bg-accent/15"
            aria-label={`Remove ${tag}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(event) => handleChange(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (draft) commit(draft);
          onBlur?.();
        }}
        aria-describedby={describedBy}
        aria-invalid={invalid}
        disabled={value.length >= max}
        placeholder={value.length >= max ? `Max ${max} tags` : value.length === 0 ? placeholder : "Add tag…"}
        className="min-w-[8rem] flex-1 bg-transparent px-1 py-1 text-sm outline-none placeholder:text-muted/70"
      />
    </div>
  );
}
