"use client";

import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface SidebarToggleProps {
  onClick: () => void;
}

export function SidebarToggle({ onClick }: SidebarToggleProps) {
  return (
    <Button
      variant="outline"
      className="md:hidden fixed top-4 left-4 z-50"
      onClick={onClick}
    >
      <Menu className="w-5 h-5" />
    </Button>
  );
}
