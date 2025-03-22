import { useEffect } from "react";

function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  handler: () => void,
  ignoredRefs: React.RefObject<HTMLElement | null>[] = []
) {
  useEffect(() => {
    const hasIgnoreAttribute = (element: Element | null): boolean => {
      if (!element) return false;
      if (element.getAttribute("data-ignore-click-outside")) return true;
      return hasIgnoreAttribute(element.parentElement);
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node | null;

      if (
        !ref ||
        (target instanceof Node && ref.current?.contains(target)) ||
        ignoredRefs.some(
          (ignoredRef) =>
            target instanceof Node && ignoredRef.current?.contains(target)
        ) ||
        (target instanceof Element && hasIgnoreAttribute(target))
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
