import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { MobileNav } from '@/components/mobile-nav'

export const Route = createRootRoute({
  component: () => (
    <>
      <nav className="bg-surface shadow-raised sticky top-0 z-40">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-8">
              <Link
                to="/"
                className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-lg font-bold text-foreground hover:text-primary transition-colors"
              >
                <img src="/pawa-logo.svg" alt="PawX.ai" className="h-6 w-6 sm:h-7 sm:w-7" />
                <span>PawX.ai</span>
              </Link>
              <div className="hidden sm:flex space-x-4 md:space-x-6">
                <Link
                  to="/"
                  className="text-sm text-muted-foreground hover:text-foreground [&.active]:text-primary [&.active]:font-medium transition-colors"
                >
                  KOL Directory
                </Link>
                <Link
                  to="/configure"
                  className="text-sm text-muted-foreground hover:text-foreground [&.active]:text-primary [&.active]:font-medium transition-colors"
                >
                  Configure
                </Link>
                <Link
                  to="/interact"
                  className="text-sm text-muted-foreground hover:text-foreground [&.active]:text-primary [&.active]:font-medium transition-colors"
                >
                  Monitor
                </Link>
                <Link
                  to="/outreach"
                  className="text-sm text-muted-foreground hover:text-foreground [&.active]:text-primary [&.active]:font-medium transition-colors"
                >
                  Outreach
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <MobileNav />
            </div>
          </div>
        </div>
      </nav>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
})
