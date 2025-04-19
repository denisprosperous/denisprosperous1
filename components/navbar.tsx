"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MessageSquare, FileText, Settings, Menu, X, Users, BarChart, Calendar, Globe } from "lucide-react"
import { cn } from "@/lib/utils"

export function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { name: "Dashboard", path: "/", icon: <BarChart className="h-5 w-5" /> },
    { name: "Conversations", path: "/conversations", icon: <MessageSquare className="h-5 w-5" /> },
    { name: "Contacts", path: "/contacts", icon: <Users className="h-5 w-5" /> },
    { name: "Templates", path: "/templates", icon: <FileText className="h-5 w-5" /> },
    { name: "Analytics", path: "/analytics", icon: <BarChart className="h-5 w-5" /> },
    { name: "Scheduling", path: "/scheduling", icon: <Calendar className="h-5 w-5" /> },
    { name: "Webhooks", path: "/webhooks", icon: <Globe className="h-5 w-5" /> },
    { name: "Settings", path: "/settings", icon: <Settings className="h-5 w-5" /> },
  ]

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold">WhatsApp AI</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <Button variant={pathname === item.path ? "default" : "ghost"} className="flex items-center gap-2">
                    {item.icon}
                    {item.name}
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn("md:hidden", isOpen ? "block" : "hidden")}>
        <div className="space-y-1 px-2 pb-3 pt-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "block rounded-md px-3 py-2 text-base font-medium",
                pathname === item.path ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted",
              )}
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center gap-2">
                {item.icon}
                {item.name}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
