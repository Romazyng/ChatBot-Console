"use client";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { Sun, Moon } from "lucide-react";

export function SidebarHeader() {
  const { theme, toggleTheme, mounted } = useTheme();

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-black dark:text-sidebar-foreground text-2xl font-bold">
        ChatBot Console
      </h1>
      {mounted && (
        <Button
          size="icon"
          variant="ghost"
          onClick={toggleTheme}
          aria-label={
            theme === "light" ? "Switch to dark mode" : "Switch to light mode"
          }
          className="h-9 w-9"
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>
      )}
    </div>
  );
}
