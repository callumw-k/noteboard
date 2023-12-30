"use client";

import { useCallback, useRef, useState } from "react";
import { animated, useSpring } from "@react-spring/web";
import { useWhiteboardCards } from "./lib/hooks/stores/whiteboard-cards";
import { useMouseEventListener } from "./lib/hooks/useMousePointer";

export default function App() {
  const [isDraggable, setIsDraggable] = useState(false);
  // the ui isn't reacting to this (yet at least), so it can exist as a ref
  const isDragging = useRef(false);
  // same here
  const startingPosition = useRef<{ x: number; y: number } | null>(null);

  const [cards, addCard] = useWhiteboardCards((state) => [
    state.cards,
    state.addCard,
  ]);

  const [springs, api] = useSpring(() => ({
    from: { x: 0, y: 0 },
  }));

  // not sure if this is totally neccessary, but it tidies up the useEffect a bit. Doesn't seem to be reattacthing
  // the listener every time
  useMouseEventListener(
    useCallback((e: MouseEvent) => {
      if (!isDragging.current) return;

      // Calculate the new position based on the difference between the current mouse position and the starting position
      const x = e.clientX - (startingPosition.current?.x ?? 0);
      const y = e.clientY - (startingPosition.current?.y ?? 0);
      console.debug(
        "X",
        e.clientX,
        "Starting X",
        startingPosition.current?.x,
        "New position",
        x,
      );

      // Update the spring with the new position
      api.start({ to: { x, y } });
    }, []),
  );

  const onMouseDown = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    if (!isDraggable) return;
    isDragging.current = true;
    startingPosition.current = {
      x: e.clientX - springs.x.get(),
      y: e.clientY - springs.y.get(),
    };
  };

  const onMouseUp = () => {
    if (!isDragging) return;
    isDragging.current = false;
    startingPosition.current = null;
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (isDraggable || e.key !== " ") return;
    setIsDraggable(true);
  };

  const onKeyUp = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key !== " ") return;
    setIsDraggable(false);
  };

  return (
    <div className="relative h-dvh">
      <main
        tabIndex={0}
        onDoubleClick={(e) => {
          //since we're transforming in the direction of the mouse
          //(i.e. numbers are negative, we need to get the negated value, positive? brain's kind of exploding)
          const xTransformed = -springs.x.get();
          const yTransformed = -springs.y.get();

          addCard({
            position: {
              x: e.clientX + xTransformed,
              y: e.clientY + yTransformed,
            },
          });
        }}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        className="absolute left-0 top-0 h-full w-full touch-none select-none overflow-hidden bg-[#eeeded] "
      >
        <animated.div
          className="top-0 left-0 origin-top-left fixed"
          style={{ ...springs }}
        >
          {cards.map((card, index) => {
            return (
              <div
                key={index}
                className="bg-white w-[350px] h-[350px] top-0 left-0 absolute"
                style={{
                  transform: `translate(${card.position.x}px, ${card.position.y}px)`,
                }}
              ></div>
            );
          })}
        </animated.div>
      </main>
    </div>
  );
}
