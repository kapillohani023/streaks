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

/*
  A tight scale on purpose. Page titles are the only large type in the app —
  everything below them is either 15px prose or a mono readout, and the gap
  between those two is what gives each screen a single obvious entry point.
*/
const variantClass: Record<TypographyVariant, string> = {
  h1: "text-[32px] font-bold tracking-[-0.02em] text-foreground",
  h2: "text-[26px] font-bold tracking-[-0.02em] text-foreground",
  h3: "text-[19px] font-bold text-foreground",
  h4: "text-base font-semibold text-foreground",
  body: "text-[15px] text-foreground",
  muted: "text-[13px] text-dim",
  caption: "text-xs text-faint",
  label: "text-[13px] font-medium text-soft",
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
