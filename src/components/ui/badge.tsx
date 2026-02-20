import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-sm px-3 py-1 text-xs font-semibold transition-all duration-200 focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-raised-sm",
        secondary:
          "bg-surface text-secondary-foreground shadow-raised-sm",
        destructive:
          "bg-destructive text-destructive-foreground shadow-raised-sm",
        outline: "bg-transparent text-foreground shadow-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
