import { useEffect } from "react";

export const useMouseEventListener = (
  handleMousePositionCallback: (e: MouseEvent) => void,
) => {
  useEffect(() => {
    window.addEventListener("mousemove", handleMousePositionCallback);
    return () => {
      window.removeEventListener("mousemove", handleMousePositionCallback);
    };
  }, [handleMousePositionCallback]);
};

export const useScrollEventListener = (
  handleScrollEventCallback: (e: WheelEvent) => void,
) => {
  useEffect(() => {
    window.addEventListener("wheel", handleScrollEventCallback);
    return () => {
      window.addEventListener("wheel", handleScrollEventCallback);
    };
  }, [handleScrollEventCallback]);
};
