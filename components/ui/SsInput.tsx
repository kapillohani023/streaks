import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

type InputSize = "sm" | "md" | "lg";

interface BaseFieldProps {
  label?: string;
  hint?: string;
  error?: string;
  fullWidth?: boolean;
  size?: InputSize;
  /** Sets the *value* in mono — for times, dates and other typed-in data. */
  mono?: boolean;
  containerClassName?: string;
}

export interface SsInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">, BaseFieldProps {}

export interface SsTextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>, BaseFieldProps {}

const wrapperClass = "flex flex-col gap-1.5";

/*
  Focus moves the border to full foreground rather than adding a ring. On a
  surface this dark a ring reads as a second, floating rectangle; recolouring
  the edge the field already has keeps the geometry still.
*/
const baseInputClass =
  "border-border bg-input-bg text-foreground placeholder:text-faint focus:border-foreground w-full rounded-lg border px-3.5 transition-colors duration-150 outline-none disabled:cursor-not-allowed disabled:opacity-60";

const sizeClass: Record<InputSize, string> = {
  sm: "py-2 text-[13px]",
  md: "py-2.5 text-sm",
  lg: "py-3 text-[15px]",
};

const labelClass =
  "text-soft font-mono text-[11px] tracking-[0.06em] uppercase";

function FieldNote({ error, hint }: { error?: string; hint?: string }) {
  if (!error && !hint) return null;
  return (
    <p
      className={`font-mono text-[10px] tracking-[0.06em] uppercase ${
        error ? "text-bad" : "text-faint"
      }`}
    >
      {error ?? hint}
    </p>
  );
}

export function SsInput({
  label,
  hint,
  error,
  fullWidth = true,
  size = "md",
  mono = false,
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
        <label htmlFor={id} className={labelClass}>
          {label}
        </label>
      )}
      <input
        id={id}
        className={[
          baseInputClass,
          sizeClass[size],
          mono ? "font-mono" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
      <FieldNote error={error} hint={hint} />
    </div>
  );
}

export function SsTextarea({
  label,
  hint,
  error,
  fullWidth = true,
  size = "md",
  mono = false,
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
        <label htmlFor={id} className={labelClass}>
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={[
          baseInputClass,
          "resize-none leading-relaxed",
          sizeClass[size],
          mono ? "font-mono" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
      <FieldNote error={error} hint={hint} />
    </div>
  );
}
