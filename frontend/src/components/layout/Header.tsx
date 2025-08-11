import React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Menu,
  Sun,
  Moon,
  Globe,
  HelpCircle,
  User,
  MoonStar,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
  className?: string;
}

export function Header({
  onToggleSidebar,
  sidebarOpen = true,
  className,
}: HeaderProps) {
  const [isDark, setIsDark] = React.useState(false);

  return (
    <header
      className={cn(
        "h-16 bg-white border-b border-islamic-green-200 flex items-center justify-between px-4",
        className
      )}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Sidebar Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-islamic-green-500 to-islamic-teal-500 rounded-lg flex items-center justify-center">
            <MoonStar className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-semibold text-islamic-green-800">
              Islamic Finance AI
            </h1>
            <p className="text-xs text-islamic-green-600">
              Sharia-Compliant Financial Consultant
            </p>
          </div>
        </div>
      </div>

      {/* Center Section - Status */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-islamic-green-50 rounded-full">
        <div className="w-2 h-2 bg-islamic-green-500 rounded-full animate-pulse" />
        <span className="text-sm text-islamic-green-700">AI Ready</span>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Language Toggle */}
        <Button variant="ghost" size="icon" className="hidden sm:flex">
          <Globe className="w-4 h-4" />
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsDark(!isDark)}
          className="hidden sm:flex"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        <Separator orientation="vertical" className="h-6 hidden sm:block" />

        {/* Help */}
        <Button variant="ghost" size="icon">
          <HelpCircle className="w-4 h-4" />
        </Button>

        {/* User Profile */}
        <Button variant="ghost" size="icon">
          <User className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
