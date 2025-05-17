
import React from "react";
import Header from "./Header";

/**
 * Main layout wrapper for authenticated pages
 * Includes the header and main content area
 */
interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default PageLayout;
