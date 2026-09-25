"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TypewriterProps {
  text: string | string[];
  speed?: number;
  initialDelay?: number;
  waitTime?: number;
  deleteSpeed?: number;
  loop?: boolean;
  className?: string;
  showCursor?: boolean;
  cursorChar?: string;
  cursorClassName?: string;
}

export function Typewriter({
  text,
  speed = 100,
  initialDelay = 0,
  waitTime = 2000,
  deleteSpeed = 50,
  loop = true,
  className,
  showCursor = true,
  cursorChar = "|",
  cursorClassName,
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [textIndex, setTextIndex] = useState(0);

  const texts = Array.isArray(text) ? text : [text];

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const currentText = texts[textIndex];

    if (!isDeleting) {
      if (currentIndex < currentText.length) {
        timeout = setTimeout(() => {
          setDisplayText((prev) => prev + currentText[currentIndex]);
          setCurrentIndex((prev) => prev + 1);
        }, currentIndex === 0 ? initialDelay : speed);
      } else if (loop || textIndex < texts.length - 1) {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, waitTime);
      }
    } else {
      if (currentIndex > 0) {
        timeout = setTimeout(() => {
          setDisplayText((prev) => prev.slice(0, -1));
          setCurrentIndex((prev) => prev - 1);
        }, deleteSpeed);
      } else {
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % texts.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [
    currentIndex,
    isDeleting,
    textIndex,
    texts,
    speed,
    initialDelay,
    waitTime,
    deleteSpeed,
    loop,
  ]);

  return (
    <span className={cn("inline-flex items-center", className)}>
      <span>{displayText}</span>
      {showCursor && (
        <span
          className={cn(
            "animate-[blink_1s_step-start_infinite] ml-0.5",
            cursorClassName
          )}
        >
          {cursorChar}
        </span>
      )}
    </span>
  );
}
