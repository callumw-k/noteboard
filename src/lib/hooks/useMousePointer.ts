import { useEffect } from "react";

export const useMouseEventListener = (
  handleMousePositionCallback: (e: MouseEvent) => void,
) => {
  useEffect(() => {
    console.debug("adding event listener");
    window.addEventListener("mousemove", handleMousePositionCallback);
    return () => {
      console.debug("removing event listener");
      window.removeEventListener("mousemove", handleMousePositionCallback);
    };
  }, [handleMousePositionCallback]);
};
