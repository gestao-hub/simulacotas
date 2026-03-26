import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const glassButtonVariants = cva(
  "relative isolate inline-flex items-center justify-center gap-2 cursor-pointer rounded-full font-semibold transition-all duration-300 overflow-hidden glass-button-reflection",
  {
    variants: {
      variant: {
        default:
          "bg-primary/80 backdrop-blur-xl border border-white/30 text-primary-foreground",
        outline:
          "bg-white/10 backdrop-blur-xl border-2 border-primary/50 text-primary",
      },
      size: {
        default: "px-8 py-3.5 text-base",
        sm: "px-5 py-2.5 text-sm",
        lg: "px-10 py-4 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glassButtonVariants> {}

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    const isOutline = variant === "outline";

    return (
      <button
        ref={ref}
        className={cn(glassButtonVariants({ variant, size, className }))}
        style={{
          boxShadow: isOutline
            ? "inset 0 1px 0 rgba(255,255,255,0.15), 0 0 16px hsl(68 89% 48% / 0.1)"
            : "inset 0 1px 0 rgba(255,255,255,0.3), 0 0 20px hsl(68 89% 48% / 0.25), 0 4px 16px rgba(0,0,0,0.1)",
        }}
        onMouseEnter={(e) => {
          const target = e.currentTarget;
          target.style.transform = "scale(1.03)";
          target.style.boxShadow = isOutline
            ? "inset 0 1px 0 rgba(255,255,255,0.2), 0 0 32px hsl(68 89% 48% / 0.25)"
            : "inset 0 1px 0 rgba(255,255,255,0.35), 0 0 40px hsl(68 89% 48% / 0.4), 0 8px 32px rgba(0,0,0,0.12)";
          props.onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          const target = e.currentTarget;
          target.style.transform = "scale(1)";
          target.style.boxShadow = isOutline
            ? "inset 0 1px 0 rgba(255,255,255,0.15), 0 0 16px hsl(68 89% 48% / 0.1)"
            : "inset 0 1px 0 rgba(255,255,255,0.3), 0 0 20px hsl(68 89% 48% / 0.25), 0 4px 16px rgba(0,0,0,0.1)";
          props.onMouseLeave?.(e);
        }}
        {...props}
      />
    );
  }
);
GlassButton.displayName = "GlassButton";

export { GlassButton, glassButtonVariants };
