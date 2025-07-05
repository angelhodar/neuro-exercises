"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, Send, X } from "lucide-react";

interface ChatInputProps {
  disabled?: boolean;
}

export function ChatInput({ disabled = false }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() || uploadedImages.length > 0) {
      setInput("");
      setUploadedImages([]);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            setUploadedImages((prev) => [...prev, result]);
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="p-2 border-t border-gray-200/50 bg-white/50 backdrop-blur-sm">
      {/* Image Preview Area */}
      {uploadedImages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {uploadedImages.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image || "/placeholder.svg"}
                alt={`Upload ${index + 1}`}
                className="w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this exercise... (Markdown supported)"
            className="w-full h-24 resize-none pr-20 pb-12 bg-white/80 border border-gray-200 focus:border-blue-200 focus:ring-blue-100 rounded-xl shadow-sm px-3 py-3 focus:outline-none focus:ring-2"
            disabled={disabled}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
          <div className="absolute bottom-3 right-3 flex items-center space-x-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-9 w-9 p-0 hover:bg-gray-100 rounded-lg"
            >
              <ImagePlus className="h-5 w-5 text-gray-500" />
            </Button>
            <Button
              type="submit"
              disabled={
                disabled || (!input.trim() && uploadedImages.length === 0)
              }
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 hover:bg-gray-100 rounded-lg"
            >
              <Send className="h-5 w-5 text-gray-500" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
