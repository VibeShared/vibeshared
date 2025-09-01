import React, { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: string; // you can pass custom widths like "800px"
}

export default function Container({
  children,
  className = "",
  maxWidth = "2560px"
}: ContainerProps) {
  return (
    <div
      className={`mx-auto px-0 container ${className}`}
      style={{ maxWidth }}
    >
      {children}
    </div>
  );
}
