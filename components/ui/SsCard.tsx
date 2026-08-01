import type { HTMLAttributes, ReactNode } from "react";

type CardVariant = "default" | "subtle" | "elevated";

export interface SsCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: "none" | "sm" | "md" | "lg";
}

export function SsCard({
  variant = "default",
  padding = "md",
  className = "",
  ...props
}: SsCardProps) {
  const variantClass: Record<CardVariant, string> = {
    default: "border border-border bg-card text-card-foreground shadow-sm",
    subtle: "border border-border/60 bg-card text-card-foreground",
    elevated: "border border-border bg-card text-card-foreground shadow-md",
  };

  const paddingClass: Record<NonNullable<SsCardProps["padding"]>, string> = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <div
      className={["rounded-2xl transition-shadow duration-200", variantClass[variant], paddingClass[padding], className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}

export function SsCardHeader({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={["mb-4", className].filter(Boolean).join(" ")} {...props} />;
}

export function SsCardTitle({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement> & { children: ReactNode }) {
  return (
    <h3 className={["text-xl font-semibold text-card-foreground", className].filter(Boolean).join(" ")} {...props}>
      {children}
    </h3>
  );
}

export function SsCardDescription({
  className = "",
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={["text-sm text-muted-foreground", className].filter(Boolean).join(" ")} {...props} />;
}

export function SsCardContent({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={className} {...props} />;
}

export function SsCardFooter({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={["mt-4", className].filter(Boolean).join(" ")} {...props} />;
}
