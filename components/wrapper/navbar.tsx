"use client";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import { Dialog } from "@radix-ui/react-dialog";
import { Github, Menu, Sparkles, Twitter, Youtube } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { useEffect, useState } from "react";
import ModeToggle from "../mode-toggle";
import { Button } from "../ui/button";
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { UserProfile } from "../user-profile";

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Reunion Info",
    href: "/",
    description: "Find useful reunion info",
  },
];

export default function NavBar() {
  const { userId } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);

  // Handle animation with useState and useEffect instead of motion.div
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out", 
        isLoaded ? "translate-y-0 opacity-100" : "-translate-y-5 opacity-0"
      )}
    >
      <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">  
        {/* Right Side */}
        <div className="flex items-center gap-2">
          <ModeToggle />
        </div>
      </div>
    </div>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";