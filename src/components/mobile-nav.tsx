import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="sm:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 w-10"
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
        <span className="sr-only">Toggle menu</span>
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsOpen(false)}
          />
          {/* Menu */}
          <div className="fixed top-14 left-0 right-0 shadow-xl z-50 bg-background border-b border-border">
            <div className="px-4 py-2">
              <div className="flex flex-col">
                <Link
                  to="/"
                  className="text-foreground hover:text-primary [&.active]:text-primary [&.active]:font-medium transition-colors py-3 text-base"
                  onClick={() => setIsOpen(false)}
                >
                  KOL Directory
                </Link>
                <Link
                  to="/interact"
                  className="text-foreground hover:text-primary [&.active]:text-primary [&.active]:font-medium transition-colors py-3 text-base"
                  onClick={() => setIsOpen(false)}
                >
                  Interact
                </Link>
                <Link
                  to="/outreach"
                  className="text-foreground hover:text-primary [&.active]:text-primary [&.active]:font-medium transition-colors py-3 text-base"
                  onClick={() => setIsOpen(false)}
                >
                  Outreach
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
