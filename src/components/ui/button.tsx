import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-bold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:shadow-raised-focus disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-raised hover:shadow-raised-hover hover:-translate-y-px active:shadow-neu-inset active:translate-y-0",
        destructive:
          "bg-destructive text-destructive-foreground shadow-raised hover:shadow-raised-hover hover:-translate-y-px active:shadow-neu-inset active:translate-y-0",
        outline:
          "bg-surface text-foreground shadow-raised-sm hover:shadow-raised hover:-translate-y-px active:shadow-neu-inset active:translate-y-0",
        secondary:
          "bg-surface text-secondary-foreground shadow-raised-sm hover:shadow-raised hover:-translate-y-px active:shadow-neu-inset active:translate-y-0",
        ghost: "bg-transparent shadow-none hover:bg-surface/60 hover:shadow-raised-sm",
        link: "bg-transparent shadow-none text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2.5",
        sm: "h-8 px-3.5 py-1.5 text-xs",
        lg: "h-12 px-7 py-3 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
