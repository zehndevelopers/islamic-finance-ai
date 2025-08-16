import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { WelcomeModal } from "@/components/modals/WelcomeModal";
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
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark";
    }
    return false;
  });
  const [welcomeModalOpen, setWelcomeModalOpen] = useState(false);
  const navigate = useNavigate();

  // Apply theme to document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleHelpClick = () => {
    setWelcomeModalOpen(true);
  };

  return (
    <>
      <header
        className={cn(
          "h-16 bg-background border-b border-islamic-green-200 dark:border-islamic-green-800/25 flex items-center justify-between px-4",
          className
        )}
      >
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Sidebar Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {}}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Logo & Title */}
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-islamic-green-500 to-islamic-teal-500 rounded-lg flex items-center justify-center">
              <MoonStar className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col items-start">
              <h1 className="font-semibold text-islamic-green-800 dark:text-islamic-green-200">
                Islamic Finance AI
              </h1>
              <p className="text-xs text-islamic-green-600 dark:text-islamic-green-400">
                Sharia-Compliant Financial Consultant
              </p>
            </div>
          </button>
        </div>

        {/* Center Section - Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-islamic-green-50 dark:bg-islamic-green-800 rounded-full">
          <div className="w-2 h-2 bg-islamic-green-500 dark:bg-islamic-green-200 rounded-full animate-pulse" />
          <span className="text-sm text-islamic-green-700 dark:text-islamic-green-50">
            AI Ready
          </span>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <Button
            className="dark:hover:bg-islamic-green-900/25"
            variant="ghost"
            size="icon"
          >
            <Globe className="w-4 h-4" />
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            className="dark:hover:bg-islamic-green-900/25"
            size="icon"
            onClick={() => setIsDark(!isDark)}
          >
            {isDark ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>

          <Separator orientation="vertical" className="h-6 hidden sm:block" />

          {/* Help */}
          <Button
            className="dark:hover:bg-islamic-green-900/25"
            variant="ghost"
            size="icon"
            onClick={handleHelpClick}
          >
            <HelpCircle className="w-4 h-4" />
          </Button>

          {/* User Profile */}
          <Button
            className="dark:hover:bg-islamic-green-900/25"
            variant="ghost"
            size="icon"
            onClick={handleProfileClick}
          >
            <User className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <WelcomeModal
        open={welcomeModalOpen}
        onOpenChange={setWelcomeModalOpen}
      />
    </>
  );
}
