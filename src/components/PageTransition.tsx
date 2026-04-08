import { useLocation } from "react-router-dom";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
    );
  }, [location.pathname]);

  return <div ref={containerRef}>{children}</div>;
};
