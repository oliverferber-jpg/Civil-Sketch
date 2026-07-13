import { forwardRef } from "react";
import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

const Card = forwardRef<HTMLDivElement, CardProps>(function Card({ className = "", ...rest }, ref) {
  const classes = ["rounded-2xl border border-slate-200 bg-white p-4 shadow-sm", className]
    .filter(Boolean)
    .join(" ");

  return <div ref={ref} className={classes} {...rest} />;
});

export default Card;
