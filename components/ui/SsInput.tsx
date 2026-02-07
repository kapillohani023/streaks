import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

type InputSize = "sm" | "md" | "lg";

interface BaseFieldProps {
  label?: string;
  hint?: string;
  error?: string;
  fullWidth?: boolean;
  size?: InputSize;
  containerClassName?: string;
}

export interface SsInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">,
    BaseFieldProps {}

export interface SsTextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    BaseFieldProps {}

const wrapperClass = "flex flex-col gap-2";
const baseInputClass =
  "rounded border-2 border-black bg-white px-4 text-black transition-colors focus:outline-none focus:ring-2 focus:ring-black disabled:cursor-not-allowed disabled:opacity-60";

const sizeClass: Record<InputSize, string> = {
  sm: "py-1.5 text-sm",
  md: "py-2 text-base",
  lg: "py-3 text-base",
};

export function SsInput({
  label,
  hint,
  error,
  fullWidth = true,
  size = "md",
  containerClassName = "",
  className = "",
  id,
  ...props
}: SsInputProps) {
  return (
    <div
      className={[wrapperClass, fullWidth ? "w-full" : "", containerClassName]
        .filter(Boolean)
        .join(" ")}
    >
      {label && (
        <label htmlFor={id} className="text-sm text-zinc-600">
          {label}
        </label>
      )}
      <input
        id={id}
        className={[baseInputClass, sizeClass[size], className]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
      {(error || hint) && (
        <p className={`text-xs ${error ? "text-red-600" : "text-zinc-500"}`}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

export function SsTextarea({
  label,
  hint,
  error,
  fullWidth = true,
  size = "md",
  containerClassName = "",
  className = "",
  id,
  ...props
}: SsTextareaProps) {
  return (
    <div
      className={[wrapperClass, fullWidth ? "w-full" : "", containerClassName]
        .filter(Boolean)
        .join(" ")}
    >
      {label && (
        <label htmlFor={id} className="text-sm text-zinc-600">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={[baseInputClass, "resize-none", sizeClass[size], className]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
      {(error || hint) && (
        <p className={`text-xs ${error ? "text-red-600" : "text-zinc-500"}`}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
