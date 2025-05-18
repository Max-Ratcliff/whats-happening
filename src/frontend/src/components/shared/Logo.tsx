
import React from "react";

/**
 * SlugScene logo component
 * Can be sized through the className prop
 */
interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "h-16 w-auto" }) => {
  return (
      <div className="flex items-center justify-center ${className}">
      <img
          src="/Slug_Scene_Logo.png"
          alt="SlugScene Logo"
          className="h-16 w-auto object-contain mt-2"
        />
      </div>
  );
};

export default Logo;
