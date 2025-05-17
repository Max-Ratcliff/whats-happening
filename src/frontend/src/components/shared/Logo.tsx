
import React from "react";

/**
 * SlugScene logo component
 * Can be sized through the className prop
 */
interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "h-8 w-auto" }) => {
  return (
    <div className={`flex items-center ${className}`}>
      {/* Slug icon placeholder */}
      <div className="bg-ucscBlue text-white p-1 rounded-md mr-2 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <path d="M18 6.5a6.5 6.5 0 0 1-12.34 3L6 21" />
          <path d="M12 7c2.76 0 5-2.01 5-4.5S14.76 0 12 0 7 2.01 7 4.5 9.24 7 12 7z" />
        </svg>
      </div>
      <span className="font-bold text-ucscBlue">SlugScene</span>
    </div>
  );
};

export default Logo;
