import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "outline"
  | "icon";
type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface SsButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children?: ReactNode;
}

const baseClass =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded border-2 font-medium transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-50";

const variantClass: Record<ButtonVariant, string> = {
  primary: "border-black bg-black text-white hover:bg-zinc-800",
  secondary: "border-black bg-white text-black hover:bg-zinc-100",
  ghost: "border-transparent bg-transparent text-black hover:bg-zinc-100",
  danger: "border-black bg-black text-white hover:bg-red-900",
  outline: "border-black bg-transparent text-black hover:bg-zinc-100",
  icon: "border-transparent bg-transparent text-black hover:bg-zinc-100",
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
