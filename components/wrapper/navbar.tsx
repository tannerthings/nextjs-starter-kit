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
        "fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-md bg-white/80 dark:bg-black/80 transition-all duration-500 ease-in-out", 
        isLoaded ? "translate-y-0 opacity-100" : "-translate-y-5 opacity-0"
      )}
    >
      <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
        {/* Logo - Mobile */}
        <div className="flex lg:hidden items-center gap-2">
          <Dialog>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px]">
              <SheetHeader className="pb-6 border-b">
                <SheetTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <span>Wiley Swift Reunion</span>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 mt-6">
                <div className="px-2 pb-4">
                  <h2 className="text-sm font-medium text-muted-foreground mb-2">
                    Navigation
                  </h2>
                  {components.map((item) => (
                    <Link key={item.href} href={item.href} prefetch={true}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-base font-normal h-11 border border-muted/40 mb-2 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/50 dark:hover:text-blue-400 transition-colors"
                      >
                        {item.title}
                      </Button>
                    </Link>
                  ))}
                </div>

                <div className="px-2 py-4 border-t">
                  <h2 className="text-sm font-medium text-muted-foreground mb-2">
                    Links
                  </h2>
                  <Link
                    href="/magic-moments.html"
                    target="_blank"
                    prefetch={true}
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-base font-normal h-11 border border-muted/40 mb-2 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/50 dark:hover:text-blue-400 transition-colors"
                    >
                      
                      Magic Moments
                    </Button>
                  </Link>
                </div>

                {!userId && (
                  <div className="px-2 py-4 border-t mt-auto">
                    <Link href="/sign-in" prefetch={true}>
                      <Button className="w-full bg-blue-600 hover:bg-blue-500">
                        Sign in
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Dialog>
          <Link href="/" prefetch={true} className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <span className="font-semibold">Reunion 2025</span>
          </Link>
        </div>

        {/* Logo - Desktop */}
        <div className="hidden lg:flex items-center gap-2">
          <Link href="/" prefetch={true} className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <span className="font-semibold">Reunion 2025</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Reunion Info</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {components.map((component) => (
                      <ListItem
                        key={component.title}
                        title={component.title}
                        href={component.href}
                      >
                        {component.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <Link href="/magic-memories.html" prefetch={true}>
            <Button variant="ghost">Magic Moments</Button>
          </Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          <ModeToggle />
          {!userId && (
            <Link href="/sign-in" prefetch={true}>
              <Button
                variant="default"
                className="bg-blue-600 hover:bg-blue-500 text-white"
              >
                Sign in
              </Button>
            </Link>
          )}
          {userId && <UserProfile />}
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