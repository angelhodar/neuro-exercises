"use client";

import { DiffWord } from "@/lib/utils";

interface DiffViewerProps {
  diffWords: DiffWord[];
}

export function DiffViewer({ diffWords }: DiffViewerProps) {
  const getWordStyle = (type: DiffWord["type"]) => {
    switch (type) {
      case "unchanged":
        return "text-green-700 bg-green-100";
      case "added":
        return "text-red-700 bg-red-100";
      case "removed":
        return "text-red-700 bg-red-100 line-through";
      default:
        return "";
    }
  };

  const getWordLabel = (type: DiffWord["type"]) => {
    switch (type) {
      case "unchanged":
        return "Coincide";
      case "added":
        return "Añadido";
      case "removed":
        return "Eliminado";
      default:
        return "";
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-md border">
      <div className="flex flex-wrap gap-1">
        {diffWords.map((word, index) => (
          <span
            key={index}
            className={`px-1 py-0.5 rounded text-sm font-medium ${getWordStyle(word.type)}`}
            title={getWordLabel(word.type)}
          >
            {word.text}
          </span>
        ))}
      </div>
    </div>
  );
}
