import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
  hideNav?: boolean;
  className?: string;
}

export function AppShell({ children, hideNav, className }: AppShellProps) {
  return (
    <div className="mx-auto min-h-[100dvh] max-w-md bg-background">
      <main className={cn("pb-20", hideNav && "pb-0", className)}>{children}</main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
