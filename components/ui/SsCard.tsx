import type { HTMLAttributes, ReactNode } from "react";

type CardVariant = "default" | "subtle" | "elevated";

export interface SsCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: "none" | "sm" | "md" | "lg";
}

/*
  Panels are defined by their edge, not by a shadow. Everything sits on the same
  plane as the grid behind it, so depth comes from the border stepping up
  (--border → --border-strong) and from the fill stepping up (--panel →
  --panel-2). `elevated` is reserved for things that genuinely float — dialogs.
*/
const variantClass: Record<CardVariant, string> = {
  default: "border-border bg-panel border",
  subtle: "border-divider bg-panel border",
  elevated:
    "border-border-strong bg-panel border shadow-[var(--shadow-dialog)]",
};

const paddingClass: Record<NonNullable<SsCardProps["padding"]>, string> = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
};

export function SsCard({
  variant = "default",
  padding = "md",
  className = "",
  ...props
}: SsCardProps) {
  return (
    <div
      className={[
        "text-foreground rounded-xl",
        variantClass[variant],
        paddingClass[padding],
        className,
      ]
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
  return (
    <div className={["mb-4", className].filter(Boolean).join(" ")} {...props} />
  );
}

export function SsCardTitle({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement> & { children: ReactNode }) {
  return (
    <h3
      className={["text-foreground text-[19px] font-bold", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </h3>
  );
}

export function SsCardDescription({
  className = "",
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={["text-dim text-[13px]", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
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
  return (
    <div className={["mt-4", className].filter(Boolean).join(" ")} {...props} />
  );
}
