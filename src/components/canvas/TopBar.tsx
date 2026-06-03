import { motion } from "framer-motion";
import { useCanvasStore } from "@/lib/canvas-store";

export function TopBar() {
  const viewport = useCanvasStore((s) => s.viewport);
  const cardCount = useCanvasStore((s) => Object.keys(s.cards).length);

  return (
    <motion.div
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="pointer-events-none fixed left-0 right-0 top-0 z-50 flex items-center justify-between p-5"
    >
      <div className="pointer-events-auto glass-panel flex items-center gap-3 rounded-full px-5 py-2.5">
        <div className="relative size-5">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-accent" />
          <div className="absolute inset-0.5 rounded-full bg-background" />
          <div className="absolute inset-1 rounded-full bg-gradient-to-br from-primary to-accent opacity-80" />
        </div>
        <span className="font-display text-lg leading-none">Elysium</span>
        <span className="text-xs text-muted-foreground">/ Canvas</span>
      </div>

      <div className="pointer-events-auto glass-panel flex items-center gap-4 rounded-full px-4 py-2 text-xs text-muted-foreground">
        <span>{cardCount} cards</span>
        <span className="h-3 w-px bg-border" />
        <span className="font-mono tabular-nums">{Math.round(viewport.scale * 100)}%</span>
      </div>
    </motion.div>
  );
}
