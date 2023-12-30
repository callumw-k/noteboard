"use client";

import { useEffect, useState } from "react";
import { animated, useSpring } from "@react-spring/web";

export default function App() {
  const [isDraggable, setIsDraggable] = useState(false);
  const [isDragging, setisDragging] = useState(false);
  const [startingPosition, setStartingPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const [springs, api] = useSpring(
    () => ({
      from: { x: 0, y: 0 },
    }),
    [],
  );

  useEffect(() => {
    const handleMousePosition = (e: MouseEvent) => {
      if (!isDraggable || !isDragging) return;

      // Calculate the new position based on the difference between the current mouse position and the starting position
      const x = e.clientX - (startingPosition?.x ?? 0);
      const y = e.clientY - (startingPosition?.y ?? 0);

      // Update the spring with the new position
      api.start({ to: { x, y } });
    };

    window.addEventListener("mousemove", handleMousePosition);
    return () => {
      window.removeEventListener("mousemove", handleMousePosition);
    };
  }, [
    api,
    isDraggable,
    isDragging,
    springs,
    startingPosition,
    startingPosition?.x,
  ]);

  console.debug("RENDERING");

  return (
    <main
      tabIndex={0}
      onMouseDown={(e) => {
        if (!isDraggable) return;
        setisDragging(true);
        const x = e.clientX - springs.x.get();
        const y = e.clientY - springs.y.get();
        setStartingPosition({ x, y });
      }}
      onMouseUp={() => {
        if (!isDragging) return;
        setisDragging(false);
        setStartingPosition(null);
      }}
      onKeyDown={(e) => {
        if (isDraggable || e.key !== " ") return;
        setIsDraggable(true);
      }}
      onKeyUp={(e) => {
        if (e.key !== " ") return;
        setIsDraggable(false);
      }}
      className="absolute left-0 top-0 h-full w-full touch-none select-none overflow-hidden bg-[#eeeded] "
    >
      <animated.div
        className="top-0 left-0 origin-top-left fixed"
        style={{ ...springs }}
      >
        <div
          className="bg-white w-[350px] h-[350px] top-0 left-0 absolute"
          style={{ transform: "translate(300px, 500px)" }}
        ></div>
      </animated.div>
    </main>
  );
}
