"use client";

import { useMemo } from "react";

interface DiffViewerProps {
  original: string;
  modified: string;
}

interface DiffWord {
  text: string;
  type: "added" | "removed" | "unchanged";
}

export function DiffViewer({ original, modified }: DiffViewerProps) {
  const diffWords = useMemo(() => {
    const originalWords = original.trim().split(/\s+/);
    const modifiedWords = modified.trim().split(/\s+/);
    
    const result: DiffWord[] = [];
    let i = 0;
    let j = 0;
    
    while (i < originalWords.length || j < modifiedWords.length) {
      if (i < originalWords.length && j < modifiedWords.length && 
          originalWords[i].toLowerCase() === modifiedWords[j].toLowerCase()) {
        // Words match
        result.push({
          text: originalWords[i],
          type: "unchanged"
        });
        i++;
        j++;
      } else if (j < modifiedWords.length && 
                 (i >= originalWords.length || 
                  (i + 1 < originalWords.length && 
                   originalWords[i + 1].toLowerCase() === modifiedWords[j].toLowerCase()))) {
        // Word was added in modified
        result.push({
          text: modifiedWords[j],
          type: "added"
        });
        j++;
      } else if (i < originalWords.length && 
                 (j >= modifiedWords.length || 
                  (j + 1 < modifiedWords.length && 
                   originalWords[i].toLowerCase() === modifiedWords[j + 1].toLowerCase()))) {
        // Word was removed from original
        result.push({
          text: originalWords[i],
          type: "removed"
        });
        i++;
      } else {
        // Words are different, mark as removed and added
        if (i < originalWords.length) {
          result.push({
            text: originalWords[i],
            type: "removed"
          });
          i++;
        }
        if (j < modifiedWords.length) {
          result.push({
            text: modifiedWords[j],
            type: "added"
          });
          j++;
        }
      }
    }
    
    return result;
  }, [original, modified]);

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
        return "Agregado";
      case "removed":
        return "Eliminado";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
          <span>Coincidencias</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
          <span>Diferencias</span>
        </div>
      </div>
      
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
      
      <div className="text-sm text-muted-foreground">
        <p>
          <strong>Coincidencias:</strong> {diffWords.filter(w => w.type === "unchanged").length} palabras
        </p>
        <p>
          <strong>Diferencias:</strong> {diffWords.filter(w => w.type !== "unchanged").length} palabras
        </p>
        <p>
          <strong>Precisión:</strong>{" "}
          {diffWords.length > 0 
            ? Math.round((diffWords.filter(w => w.type === "unchanged").length / diffWords.length) * 100)
            : 0}%
        </p>
      </div>
    </div>
  );
} 