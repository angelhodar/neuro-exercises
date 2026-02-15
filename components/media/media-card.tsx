import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MediaCardProps = React.HTMLAttributes<HTMLDivElement>;

export function MediaCard({ children, className, ...props }: MediaCardProps) {
  return (
    <Card
      className={cn("flex h-full flex-col overflow-hidden", className)}
      {...props}
    >
      {children}
    </Card>
  );
}

type MediaCardContainerProps = React.HTMLAttributes<HTMLDivElement>;

export function MediaCardContainer({
  children,
  className,
  ...props
}: MediaCardContainerProps) {
  return (
    <div
      className={cn(
        "group relative h-[340px] min-h-[300px] w-full cursor-pointer overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

type MediaCardTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

export function MediaCardTitle({
  children,
  className,
  ...props
}: MediaCardTitleProps) {
  return (
    <h3
      className={cn("font-semibold text-lg leading-tight", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

type MediaCardDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

export function MediaCardDescription({
  children,
  className,
  ...props
}: MediaCardDescriptionProps) {
  return (
    <p
      className={cn("line-clamp-2 text-muted-foreground text-sm", className)}
      {...props}
    >
      {children}
    </p>
  );
}

interface MediaCardBadgesProps extends React.HTMLAttributes<HTMLDivElement> {
  badges: string[];
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export function MediaCardBadges({
  badges,
  variant = "secondary",
  className,
  ...props
}: MediaCardBadgesProps) {
  return (
    <div className={cn("flex flex-wrap gap-1", className)} {...props}>
      {badges.map((badge) => (
        <Badge key={badge} variant={variant}>
          {badge}
        </Badge>
      ))}
    </div>
  );
}
