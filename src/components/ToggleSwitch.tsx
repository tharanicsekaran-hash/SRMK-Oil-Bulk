"use client";
import React from "react";

type Props = {
  leftLabel?: string;
  rightLabel?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export default function ToggleSwitch({ leftLabel, rightLabel, checked, onChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      {leftLabel && <span className="text-xs text-gray-600">{leftLabel}</span>}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? "bg-gray-900" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      {rightLabel && <span className="text-xs text-gray-600">{rightLabel}</span>}
    </div>
  );
}
