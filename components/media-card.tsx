"use client";

import type React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image, { ImageProps } from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Main MediaCard container
interface MediaCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function MediaCard({ children, className, ...props }: MediaCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)} {...props}>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}

export function MediaCardImage({ className, ...props }: ImageProps) {
  return (
    <Image
      className={cn(
        "h-full w-full object-cover transition-transform hover:scale-105",
        className,
      )}
      {...props}
    />
  );
}

export function ExpandableMediaCardImage({
  className,
  width,
  height,
  ...props
}: ImageProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <MediaCardImage
          className={cn(
            "transition-all group-hover:brightness-90 cursor-pointer group",
            className,
          )}
          width={width}
          height={height}
          {...props}
        />
      </DialogTrigger>
      <DialogContent className="max-w-4xl p-4">
        <DialogTitle>{props.alt}</DialogTitle>
        <div className="relative w-full h-[60vh]">
          <Image {...props} fill className="object-contain" />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// MediaCard Title component
interface MediaCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export function MediaCardTitle({
  children,
  as: Component = "h3",
  className,
  ...props
}: MediaCardTitleProps) {
  return (
    <Component
      className={cn("font-semibold leading-tight tracking-tight", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

// MediaCard Description component
interface MediaCardDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  lines?: number;
}

export function MediaCardDescription({
  children,
  lines,
  className,
  ...props
}: MediaCardDescriptionProps) {
  const lineClampClass = lines ? `line-clamp-${lines}` : "";

  return (
    <p
      className={cn("text-sm text-muted-foreground", lineClampClass, className)}
      {...props}
    >
      {children}
    </p>
  );
}

// MediaCard Tags component
interface MediaCardTagsProps extends React.HTMLAttributes<HTMLDivElement> {
  tags: string[];
  variant?: "default" | "secondary" | "outline";
  size?: "default" | "sm";
}

export function MediaCardTags({
  tags,
  variant = "secondary",
  size = "sm",
  className,
  ...props
}: MediaCardTagsProps) {
  return (
    <div className={cn("flex flex-wrap gap-1", className)} {...props}>
      {tags.map((tag, index) => (
        <Badge
          key={index}
          variant={variant}
          className={size === "sm" ? "text-xs" : ""}
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
}

export function ClickableMediaTags({
  tags,
  variant = "secondary",
  size = "sm",
  className,
  ...props
}: MediaCardTagsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTagClick = (tag: string) => {
    const currentParams = new URLSearchParams(searchParams.toString());
    const currentTags = currentParams.getAll("tags");

    // Add the tag if it's not already present
    if (!currentTags.includes(tag)) {
      currentParams.append("tags", tag);
    }

    router.push(`?${currentParams.toString()}`);
  };

  return (
    <div className={cn("flex flex-wrap gap-1", className)} {...props}>
      {tags.map((tag, index) => (
        <Badge
          key={index}
          variant={variant}
          className={cn(
            size === "sm" ? "text-xs" : "",
            "cursor-pointer hover:opacity-80 transition-opacity",
          )}
          onClick={() => handleTagClick(tag)}
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
}

// MediaCard Actions component
interface MediaCardActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  align?: "left" | "center" | "right" | "between";
}

export function MediaCardActions({
  children,
  align = "left",
  className,
  ...props
}: MediaCardActionsProps) {
  const alignmentClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
    between: "justify-between",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        alignmentClasses[align],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// MediaCard Label component
interface MediaCardLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export function MediaCardLabel({
  children,
  position = "top-right",
  variant = "default",
  className,
  ...props
}: MediaCardLabelProps) {
  const positionClasses = {
    "top-left": "top-2 left-2",
    "top-right": "top-2 right-2",
    "bottom-left": "bottom-2 left-2",
    "bottom-right": "bottom-2 right-2",
  };

  return (
    <div className={cn("absolute z-10", positionClasses[position])}>
      <Badge variant={variant} className={className} {...props}>
        {children}
      </Badge>
    </div>
  );
}

// Content wrapper for text content
interface MediaCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
}

export function MediaCardContent({
  children,
  padding = "md",
  className,
  ...props
}: MediaCardContentProps) {
  const paddingClasses = {
    none: "p-0",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <div
      className={cn("space-y-3", paddingClasses[padding], className)}
      {...props}
    >
      {children}
    </div>
  );
}

// Selectable MediaCard component for exercises
interface SelectableMediaCardProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  alt: string;
  name?: string;
  showName?: boolean;
  selected?: boolean;
  disabled?: boolean;
  overlay?: React.ReactNode;
  onSelect?: () => void;
}

export function SelectableMediaCard({
  src,
  alt,
  name,
  showName = true,
  selected = false,
  disabled = false,
  overlay,
  onSelect,
  className,
  ...props
}: SelectableMediaCardProps) {
  return (
    <div
      className={cn(
        "relative cursor-pointer rounded-lg border-2 transition-all duration-200 bg-white",
        disabled && "pointer-events-none opacity-75",
        selected
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg"
          : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 hover:shadow-md",
        className
      )}
      onClick={onSelect}
      {...props}
    >
      <img
        src={src || "/placeholder.svg"}
        alt={alt}
        className="w-full h-48 md:h-56 lg:h-64 object-cover p-1 rounded-lg"
        crossOrigin="anonymous"
      />
      {selected && (
        <div className="absolute top-3 right-3 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold shadow-lg">
          ✓
        </div>
      )}
      {showName && name && (
        <div className="p-3 text-center">
          <p className="text-sm font-medium text-muted-foreground truncate">
            {name}
          </p>
        </div>
      )}
      {overlay}
    </div>
  );
}
