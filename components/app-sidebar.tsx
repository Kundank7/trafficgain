"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/contexts/auth-context"
import { useIsMobile } from "@/hooks/use-mobile"

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const isMobile = useIsMobile()

  // Check if the current path is admin
  const isAdmin = user?.role === "admin"

  // User menu items
  const userMenuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Deposit", href: "/deposit", icon: CreditCard },
    { name: "Orders", href: "/orders", icon: Package },
    { name: "Traffic Calculator", href: "/calculator", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
  ]

  // Admin menu items
  const adminMenuItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Deposits", href: "/admin/deposits", icon: CreditCard },
    { name: "Orders", href: "/admin/orders", icon: Package },
    { name: "Audit Logs", href: "/admin/logs", icon: FileText },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ]

  // Select the appropriate menu items based on the role
  const menuItems = isAdmin ? adminMenuItems : userMenuItems

  const sidebarContent = (
    <>
      <SidebarHeader className="flex items-center justify-between p-4">
        <Link href={isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-emerald-400" />
          <span className="font-bold text-xl">TrafficPro</span>
        </Link>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild isActive={pathname === item.href}>
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <Avatar>
            <AvatarImage src="/placeholder.svg" alt={user?.email || "User"} />
            <AvatarFallback className="bg-slate-700">{user?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{user?.email || "User"}</span>
            <span className="text-xs text-slate-400">{user?.role || "user"}</span>
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full flex items-center gap-2" onClick={() => logout()}>
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Button>
      </SidebarFooter>
    </>
  )

  // For mobile, use a Sheet component
  if (isMobile) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
            <span className="font-bold text-xl">TrafficPro</span>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-slate-800 border-slate-700">
              {sidebarContent}
            </SheetContent>
          </Sheet>
        </div>
        <div className="h-16"></div> {/* Spacer for fixed header */}
      </>
    )
  }

  return <Sidebar>{sidebarContent}</Sidebar>
}
