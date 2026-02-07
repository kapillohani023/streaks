import type { HTMLAttributes, ReactNode } from "react";

type TypographyVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "body"
  | "muted"
  | "caption"
  | "label";

type ElementTag = "h1" | "h2" | "h3" | "h4" | "p" | "span" | "label";

export interface SsTypographyProps extends HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant;
  as?: ElementTag;
  children: ReactNode;
}

const variantClass: Record<TypographyVariant, string> = {
  h1: "text-4xl font-bold tracking-tight",
  h2: "text-3xl font-semibold tracking-tight",
  h3: "text-2xl font-semibold",
  h4: "text-xl font-semibold",
  body: "text-base text-black",
  muted: "text-sm text-zinc-600",
  caption: "text-xs text-zinc-500",
  label: "text-sm font-medium text-zinc-700",
};

const defaultElement: Record<TypographyVariant, ElementTag> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  body: "p",
  muted: "p",
  caption: "span",
  label: "label",
};

export function SsTypography({
  variant = "body",
  as,
  className = "",
  children,
  ...props
}: SsTypographyProps) {
  const Component = (as || defaultElement[variant]) as ElementTag;
  return (
    <Component
      className={[variantClass[variant], className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </Component>
  );
}
