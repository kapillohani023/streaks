import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "outline"
  | "icon";
type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface SsButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children?: ReactNode;
  ref?: Ref<HTMLButtonElement>;
}

const baseClass =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border font-medium transition-all duration-200 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100";

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "border-primary bg-primary text-primary-foreground shadow-sm hover:opacity-90",
  secondary:
    "border-border bg-card text-card-foreground shadow-sm hover:bg-muted",
  ghost: "border-transparent bg-transparent text-foreground hover:bg-muted",
  danger:
    "border-destructive bg-destructive text-destructive-foreground shadow-sm hover:opacity-90",
  outline: "border-border bg-transparent text-foreground hover:bg-muted",
  icon: "border-transparent bg-transparent text-foreground hover:bg-muted",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-5 py-3 text-base",
  icon: "h-10 w-10 p-0",
};

export function SsButton({
  variant = "primary",
  size = "md",
  block = false,
  loading = false,
  leftIcon,
  rightIcon,
  children,
  className = "",
  disabled,
  ...props
}: SsButtonProps) {
  const isDisabled = disabled || loading;
  const widthClass = block ? "w-full" : "";

  return (
    <button
      disabled={isDisabled}
      className={[
        baseClass,
        variantClass[variant],
        sizeClass[size],
        widthClass,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {leftIcon}
      {loading ? "Loading..." : children}
      {rightIcon}
    </button>
  );
}
