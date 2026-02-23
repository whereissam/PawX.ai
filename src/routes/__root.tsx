import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { MobileNav } from '@/components/mobile-nav'
import { useAuth } from '@/hooks/use-auth'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut } from 'lucide-react'

function NavbarAuth() {
  const { user, isLoading, signInWithTwitter, signOut } = useAuth()

  if (isLoading) {
    return <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
  }

  if (!user) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={signInWithTwitter}
        className="gap-1.5"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        <span className="hidden sm:inline">Connect X</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image || undefined} alt={user.name} />
            <AvatarFallback className="text-xs">
              {user.name?.charAt(0)?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5 text-sm font-medium truncate">
          {user.name}
        </div>
        <DropdownMenuItem onClick={signOut} className="gap-2 text-destructive">
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

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
            <div className="flex items-center gap-2">
              <NavbarAuth />
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
