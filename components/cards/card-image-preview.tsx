"use client";

import { useState } from "react";

type CardImagePreviewProps = {
  src: string | null;
  alt: string;
  children: React.ReactNode;
  className?: string;
};

export function CardImagePreview({
  src,
  alt,
  children,
  className = "",
}: CardImagePreviewProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  return (
    <>
      <div
        className={`flex shrink-0 items-center justify-center overflow-hidden bg-slate-100 ${className}`}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onMouseMove={(event) => {
          setPosition({
            x: event.clientX + 24,
            y: event.clientY - 80,
          });
        }}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover"
          />
        ) : (
          children
        )}
      </div>

      {src && isVisible && (
        <div
          className="pointer-events-none fixed z-[9999] hidden overflow-hidden rounded-3xl border bg-white p-2 shadow-2xl md:block"
          style={{
            left: position.x,
            top: position.y,
          }}
        >
          <img
            src={src}
            alt={alt}
            className="h-[320px] w-[230px] rounded-2xl object-cover"
          />
        </div>
      )}
    </>
  );
}