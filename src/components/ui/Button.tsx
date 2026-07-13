import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type ButtonVariant = "solid" | "outline" | "ghost" | "ghost-danger" | "danger";

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  variant?: ButtonVariant;
  /** Only meaningful with variant="ghost" — renders the same look as an active toggle. */
  active?: boolean;
  size?: "sm" | "md";
  icon?: LucideIcon;
  fullWidth?: boolean;
  /** Omit children to render an icon-only square button — pass aria-label in that case. */
  children?: ReactNode;
};

const BASE_CLASSES =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

const SIZES: Record<"sm" | "md", { withText: string; iconOnly: string; icon: number }> = {
  sm: { withText: "px-3 py-1.5 text-sm", iconOnly: "p-1.5", icon: 14 },
  md: { withText: "px-4 py-2 text-sm", iconOnly: "p-2", icon: 16 },
};

function variantClasses(variant: ButtonVariant, active: boolean): string {
  switch (variant) {
    case "solid":
      return "bg-slate-900 text-white hover:bg-slate-800";
    case "outline":
      return "border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-100";
    case "ghost":
      return active ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200";
    case "ghost-danger":
      return "bg-transparent text-rose-500 hover:bg-rose-50 disabled:text-slate-300 disabled:hover:bg-transparent";
    case "danger":
      return "bg-rose-500 text-white hover:bg-rose-600";
  }
}

export default function Button({
  variant = "solid",
  active = false,
  size = "md",
  icon: Icon,
  fullWidth = false,
  className = "",
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  const iconOnly = !children;
  const sizing = SIZES[size];

  const classes = [
    BASE_CLASSES,
    variantClasses(variant, active),
    iconOnly ? sizing.iconOnly : sizing.withText,
    fullWidth ? "w-full" : "",
    fullWidth && !iconOnly ? "justify-start" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} {...rest}>
      {Icon ? <Icon size={sizing.icon} /> : null}
      {children}
    </button>
  );
}
