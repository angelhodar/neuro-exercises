"use client";

import type React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import Image, { ImageProps } from "next/image";

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
