import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MediaCardProps = React.HTMLAttributes<HTMLDivElement>;

export function MediaCard({ children, className, ...props }: MediaCardProps) {
  return (
    <Card
      className={cn(
        "group/card flex h-full flex-col overflow-hidden rounded-2xl border-0 shadow-md ring-0 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl",
        className
      )}
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
        "relative aspect-[4/3] w-full overflow-hidden bg-muted",
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
      className={cn("font-semibold text-sm leading-tight", className)}
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
  maxVisible?: number;
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export function MediaCardBadges({
  badges,
  maxVisible = 3,
  variant = "secondary",
  className,
  ...props
}: MediaCardBadgesProps) {
  const visible = badges.slice(0, maxVisible);
  const overflow = badges.length - maxVisible;

  return (
    <div className={cn("flex flex-wrap gap-1", className)} {...props}>
      {visible.map((badge) => (
        <Badge key={badge} variant={variant}>
          {badge}
        </Badge>
      ))}
      {overflow > 0 && <Badge variant="outline">+{overflow}</Badge>}
    </div>
  );
}
