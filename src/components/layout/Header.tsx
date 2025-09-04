import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { WelcomeModal } from "@/components/modals/WelcomeModal";
import { Sun, Moon, Globe, ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

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

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <>
      <header
        className={cn(
          "relative h-16 flex items-center justify-between px-4 bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800/25 rounded-2xl",
          className
        )}
      >
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="ml-auto bg-transparent border-none"
              >
                IMF GPT 1.1 <ChevronDownIcon className="ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>IMF GPT 1.1</DropdownMenuLabel>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2">
          <div className="relative hidden md:flex items-center gap-2">
            <div className="relative flex items-center space-x-2 bg-gray-200 dark:bg-gray-700 rounded-full p-1">
              <Button
                variant="ghost"
                className="w-8 h-8 bg-transparent hover:bg-gray-50/50 dark:hover:bg-islamic-green-900/25 rounded-full relative z-10"
                size="icon"
                onClick={() => setIsDark(false)}
              >
                <Sun
                  className={cn("w-5 h-5 text-gray-400 dark:text-gray-200", {
                    "text-primary/75 dark:text-islamic-green-200": !isDark,
                  })}
                />
              </Button>
              <div
                className={cn(
                  "absolute top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gray-50 dark:bg-gray-800 rounded-full transition-all duration-300 ease-in-out shadow-sm",
                  { "translate-x-8": isDark, "-translate-x-2": !isDark }
                )}
              />
              <Button
                variant="ghost"
                className="w-8 h-8 bg-transparent hover:bg-gray-50/50 dark:hover:bg-islamic-green-900/25 rounded-full relative z-10"
                size="icon"
                onClick={() => setIsDark(true)}
              >
                <Moon
                  className={cn("w-5 h-5 text-gray-400 dark:text-gray-200", {
                    "text-primary/75 dark:text-islamic-green-200": isDark,
                  })}
                />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Input placeholder="Search" />
          <Button
            className="dark:hover:bg-islamic-green-900/25 rounded-full"
            variant="ghost"
            size="icon"
          >
            <Globe className="w-4 h-4" />
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
