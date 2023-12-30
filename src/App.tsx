"use client";

import { useCallback, useRef, useState } from "react";
import { animated, useSpring } from "@react-spring/web";
import { useWhiteboardCards } from "./lib/hooks/stores/whiteboard-cards";
import {
  useMouseEventListener,
  useScrollEventListener,
} from "@/lib/hooks/useWindowListeners";

export default function App() {
  const [isDraggable, setIsDraggable] = useState(false);

  // the ui isn't reacting to this (yet at least), so it can exist as a ref
  const isDragging = useRef(false);
  const isScrollable = useRef(false);
  // same here
  const startingPosition = useRef<{ x: number; y: number } | null>(null);

  const [cards, addCard] = useWhiteboardCards((state) => [
    state.cards,
    state.addCard,
  ]);

  const [springs, api] = useSpring(() => ({
    from: { x: 0, y: 0, scale: 1 },
  }));

  // not sure if this is totally neccessary, but it tidies up the useEffect a bit. Doesn't seem to be reattacthing
  // the listener every time
  useMouseEventListener(
    useCallback(
      (e: MouseEvent) => {
        if (!isDragging.current) return;

        // Calculate the new position based on the difference between the current mouse position and the starting position
        const x = e.clientX - (startingPosition.current?.x ?? 0);
        const y = e.clientY - (startingPosition.current?.y ?? 0);

        // Update the spring with the new position
        api.start({ to: { x, y } });
      },
      [api],
    ),
  );

  useScrollEventListener(
    useCallback(
      (e: WheelEvent) => {
        if (!isScrollable.current) return;

        if (e.deltaY < 0) {
          api.start({
            to: {
              scale: springs.scale.get() + 0.1,
            },
          });
        } else {
          api.start({ to: { scale: springs.scale.get() - 0.1 } });
        }
      },
      [api, springs.scale],
    ),
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
    if (e.key === " " && !isDraggable) {
      setIsDraggable(true);
      return;
    }

    if (e.key === "Control" && !isScrollable.current) {
      isScrollable.current = true;
      return;
    }
  };

  const onKeyUp = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === " " && isDraggable) {
      setIsDraggable(false);
      return;
    }
    if (e.key === "Control" && isScrollable.current) {
      isScrollable.current = false;
      return;
    }
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
              x: (e.clientX + xTransformed) / springs.scale.get(),
              y: (e.clientY + yTransformed) / springs.scale.get(),
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
