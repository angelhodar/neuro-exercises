"use client";

import { ImagePlus, Send, Square, X } from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  disabled?: boolean;
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  onStop?: () => void;
}

export function ChatInput({
  disabled = false,
  input,
  onInputChange,
  onSubmit,
  isLoading,
  onStop,
}: ChatInputProps) {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() || uploadedImages.length > 0) {
      onSubmit();
      setUploadedImages([]);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      for (const file of Array.from(files)) {
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            setUploadedImages((prev) => [...prev, result]);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="border-gray-200/50 border-t bg-white/50 p-2 backdrop-blur-sm">
      {/* Image Preview Area */}
      {uploadedImages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {uploadedImages.map((image, index) => (
            <div className="group relative" key={image.slice(0, 64)}>
              {/* biome-ignore lint/performance/noImgElement: data URL from FileReader cannot use next/image */}
              <img
                alt={`Upload ${index + 1}`}
                className="h-16 w-16 rounded-lg border border-gray-200 object-cover shadow-sm"
                height={64}
                src={image || "/placeholder.svg"}
                width={64}
              />
              <button
                className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => removeImage(index)}
                type="button"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form className="space-y-3" onSubmit={handleSubmit}>
        <div className="relative">
          <textarea
            className="h-24 w-full resize-none rounded-xl border border-gray-200 bg-white/80 px-3 py-3 pr-20 pb-12 shadow-sm focus:border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-100"
            disabled={disabled || isLoading}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Ask about this exercise... (Markdown supported)"
            value={input}
          />
          <input
            accept="image/*"
            className="hidden"
            multiple
            onChange={handleImageUpload}
            ref={fileInputRef}
            type="file"
          />
          <div className="absolute right-3 bottom-3 flex items-center space-x-2">
            <Button
              className="h-9 w-9 rounded-lg p-0 hover:bg-gray-100"
              disabled={isLoading}
              onClick={() => fileInputRef.current?.click()}
              size="sm"
              type="button"
              variant="ghost"
            >
              <ImagePlus className="h-5 w-5 text-gray-500" />
            </Button>

            {isLoading && onStop ? (
              <Button
                className="h-9 w-9 rounded-lg p-0 hover:bg-gray-100"
                onClick={onStop}
                size="sm"
                type="button"
                variant="ghost"
              >
                <Square className="h-5 w-5 text-gray-500" />
              </Button>
            ) : (
              <Button
                className="h-9 w-9 rounded-lg p-0 hover:bg-gray-100"
                disabled={
                  disabled ||
                  isLoading ||
                  (!input.trim() && uploadedImages.length === 0)
                }
                size="sm"
                type="submit"
                variant="ghost"
              >
                <Send className="h-5 w-5 text-gray-500" />
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
