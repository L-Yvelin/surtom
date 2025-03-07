import { useEffect } from "react";

function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  handler: () => void,
  ignoredRefs: React.RefObject<any | null>[] = []
) {
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        !ref ||
        (e.target instanceof Node && ref.current?.contains(e.target)) ||
        ignoredRefs.some(
          (ignoredRef) =>
            e.target instanceof Node && ignoredRef.current?.contains(e.target)
        )
      ) {
        return;
      }
      handler();
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, handler, ignoredRefs]);
}

export default useClickOutside;
