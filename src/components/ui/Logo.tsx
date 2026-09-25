import React from "react";

interface LogoProps {
  size?: number;
  className?: string;
  color?: string;
}

export function Logo({ size = 28, className = "", color = "currentColor" }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 42 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer rounded container with double stroke effect */}
      <rect
        x="2"
        y="2"
        width="38"
        height="38"
        rx="10"
        stroke={color}
        strokeWidth="2.5"
      />
      <rect
        x="6.5"
        y="6.5"
        width="29"
        height="29"
        rx="7"
        stroke={color}
        strokeWidth="1.2"
        strokeOpacity="0.8"
      />
      {/* 3 rounded horizontal bars */}
      <rect
        x="11.5"
        y="14"
        width="19"
        height="3.5"
        rx="1.75"
        fill={color}
      />
      <rect
        x="11.5"
        y="20"
        width="14"
        height="3.5"
        rx="1.75"
        fill={color}
      />
      <rect
        x="11.5"
        y="26"
        width="16"
        height="3.5"
        rx="1.75"
        fill={color}
      />
    </svg>
  );
}

interface BrandLogoProps {
  size?: number;
  className?: string;
  textColor?: string;
  iconColor?: string;
}

export function BrandLogo({
  size = 26,
  className = "",
  textColor = "text-gray-950",
  iconColor = "#0a0a0a",
}: BrandLogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none group ${className}`}>
      <Logo size={size} color={iconColor} className="group-hover:opacity-85 transition-opacity flex-shrink-0" />
      <span className={`text-[18.5px] font-black font-hero-title tracking-[-0.03em] ${textColor} uppercase flex items-center leading-none`}>
        <span>CV</span>
        <span className="font-semibold text-gray-400 group-hover:text-gray-500 transition-colors ml-[0.5px]">VIEWS</span>
      </span>
    </div>
  );
}

