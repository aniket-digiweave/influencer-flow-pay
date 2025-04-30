
import React from "react";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const PageLayout = ({ children, className }: PageLayoutProps) => {
  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      <header className="py-4 px-6 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center">
          <svg 
            width="32" 
            height="32" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className="text-primary"
          >
            <path 
              d="M12 6V18M18 12H6" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
          <h1 className="text-xl font-semibold ml-2">Digiweave Mediatech</h1>
        </div>
        <nav className="space-x-4">
          <a href="/" className="text-sm font-medium hover:text-primary transition-colors">
            Influencer Form
          </a>
          <a href="/client" className="text-sm font-medium hover:text-primary transition-colors">
            Client Form
          </a>
        </nav>
      </header>
      
      <main className={cn("flex-1 container py-10", className)}>
        {children}
      </main>
      
      <footer className="py-4 px-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Influencer Payment Manager. All rights reserved.
      </footer>
    </div>
  );
};

export default PageLayout;
