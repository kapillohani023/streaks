import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "outline"
  | "icon";
type ButtonSize = "xs" | "sm" | "md" | "lg" | "icon" | "icon-sm";

export interface SsButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  loading?: boolean;
  /**
   * Renders the label as an uppercase mono command — the app's voice for
   * anything that *does* something (MARK, SAVE ENTRY, DELETE). Prose-cased
   * labels stay sans, so the two never blur together.
   */
  mono?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children?: ReactNode;
  ref?: Ref<HTMLButtonElement>;
}

const baseClass =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border transition-all duration-200 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100";

/*
  The glow on the primary variant is the one piece of decoration in the button
  set, and it is load-bearing: with a flat foreground fill and no shadow, the
  primary action was indistinguishable from a filled status chip.
*/
const variantClass: Record<ButtonVariant, string> = {
  primary:
    "border-foreground bg-foreground text-background hover:shadow-[0_0_20px_var(--glow-25)]",
  secondary:
    "border-border bg-panel text-foreground hover:border-border-strong hover:bg-sunken",
  ghost:
    "border-transparent bg-transparent text-soft hover:bg-sunken hover:text-foreground",
  /*
    Disabled danger goes neutral rather than translucent. A half-faded red
    "DELETE MY ACCOUNT" still reads as armed — the button has to look inert
    until the confirmation is actually typed.
  */
  danger:
    "border-bad bg-bad text-background hover:opacity-90 disabled:border-border disabled:bg-panel-2 disabled:text-mid disabled:opacity-100",
  outline:
    "border-border-strong bg-transparent text-soft hover:border-foreground hover:text-foreground",
  icon: "border-border bg-panel text-soft hover:border-mid hover:text-foreground",
};

const sizeClass: Record<ButtonSize, string> = {
  xs: "px-3 py-1.5 text-xs",
  sm: "px-3.5 py-2 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-[15px]",
  icon: "h-9 w-9 p-0",
  "icon-sm": "h-7 w-7 p-0",
};

/*
  Mono commands set their own type scale — the sans sizes read far too large in
  caps — and their own *fixed heights*.

  Height comes from `h-*` rather than vertical padding on purpose: 11px caps on
  the inherited 1.5 line-height produced a 38.5px control, which never quite
  lined up with the 36px icon buttons sitting beside it in a header. Pinning
  each rung to the icon sizes (md/lg → h-9, sm → h-8, xs → icon-sm's h-7) means
  a row of mixed controls agrees on both its top edge and its centre line.
*/
const monoSizeClass: Record<ButtonSize, string> = {
  xs: "h-7 px-3 text-[10px]",
  sm: "h-8 px-3 text-[10px]",
  md: "h-9 px-4 text-[11px]",
  lg: "h-10 px-5 text-xs",
  icon: "h-9 w-9 p-0 text-[11px]",
  "icon-sm": "h-7 w-7 p-0 text-[10px]",
};

const monoClass = "font-mono font-bold tracking-[0.08em] uppercase";

export function SsButton({
  variant = "primary",
  size = "md",
  block = false,
  loading = false,
  mono = false,
  leftIcon,
  rightIcon,
  children,
  className = "",
  disabled,
  ...props
}: SsButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={[
        baseClass,
        mono ? monoClass : "font-medium",
        variantClass[variant],
        mono ? monoSizeClass[size] : sizeClass[size],
        block ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {leftIcon}
      {loading ? (mono ? "WORKING…" : "Loading...") : children}
      {rightIcon}
    </button>
  );
}
