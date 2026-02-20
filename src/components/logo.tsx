export function PawXLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Main paw pad */}
      <ellipse
        cx="32"
        cy="38"
        rx="14"
        ry="12"
        className="fill-primary"
      />
      {/* Top left toe */}
      <ellipse
        cx="17"
        cy="20"
        rx="6"
        ry="7"
        className="fill-primary"
        transform="rotate(-15 17 20)"
      />
      {/* Top right toe */}
      <ellipse
        cx="47"
        cy="20"
        rx="6"
        ry="7"
        className="fill-primary"
        transform="rotate(15 47 20)"
      />
      {/* Middle left toe */}
      <ellipse
        cx="24"
        cy="16"
        rx="5"
        ry="6.5"
        className="fill-primary"
        transform="rotate(-5 24 16)"
      />
      {/* Middle right toe */}
      <ellipse
        cx="40"
        cy="16"
        rx="5"
        ry="6.5"
        className="fill-primary"
        transform="rotate(5 40 16)"
      />
      {/* Sparkle / AI indicator */}
      <circle cx="52" cy="10" r="3" className="fill-primary opacity-60" />
      <circle cx="56" cy="14" r="1.5" className="fill-primary opacity-40" />
      <circle cx="54" cy="6" r="1.5" className="fill-primary opacity-40" />
    </svg>
  )
}
