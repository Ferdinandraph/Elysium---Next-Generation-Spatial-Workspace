import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function CursorGlow() {
  const [pos, setPos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <motion.div
      className="pointer-events-none fixed z-[100] h-[600px] w-[600px] rounded-full mix-blend-screen"
      style={{
        background:
          "radial-gradient(circle, oklch(0.78 0.17 295 / 0.18), oklch(0.75 0.18 200 / 0.08) 40%, transparent 70%)",
        left: pos.x - 300,
        top: pos.y - 300,
      }}
      animate={{ left: pos.x - 300, top: pos.y - 300 }}
      transition={{ type: "spring", damping: 30, stiffness: 200, mass: 0.5 }}
    />
  );
}
