import { memo, useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useCanvasStore, colorStyles, type CanvasCard } from "@/lib/canvas-store";
import { cn } from "@/lib/utils";

interface CardProps {
  card: CanvasCard;
  selected: boolean;
  dimmed: boolean;
  scale: number;
}

function CardInner({ card, selected, dimmed, scale }: CardProps) {
  const updateCard = useCanvasStore((s) => s.updateCard);
  const bringToFront = useCanvasStore((s) => s.bringToFront);
  const selectCard = useCanvasStore((s) => s.selectCard);
  const [editing, setEditing] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ mx: number; my: number; cx: number; cy: number } | null>(null);
  const movedRef = useRef(false);

  const accent = colorStyles[card.color].accent;

  // pointer tilt
  const onMouseMove = (e: React.MouseEvent) => {
    if (!ref.current || editing) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ ry: px * 6, rx: -py * 6 });
  };
  const onMouseLeave = () => setTilt({ rx: 0, ry: 0 });

  // drag
  const onPointerDown = (e: React.PointerEvent) => {
    if (editing) return;
    if ((e.target as HTMLElement).closest("[data-no-drag]")) return;
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    bringToFront(card.id);
    selectCard(card.id, e.shiftKey);
    dragStartRef.current = { mx: e.clientX, my: e.clientY, cx: card.x, cy: card.y };
    movedRef.current = false;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragStartRef.current) return;
    const dx = (e.clientX - dragStartRef.current.mx) / scale;
    const dy = (e.clientY - dragStartRef.current.my) / scale;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) movedRef.current = true;
    updateCard(card.id, { x: dragStartRef.current.cx + dx, y: dragStartRef.current.cy + dy });
  };
  const onPointerUp = (e: React.PointerEvent) => {
    dragStartRef.current = null;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  // double click to edit
  const onDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(true);
  };

  useEffect(() => {
    if (!editing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEditing(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editing]);

  return (
    <motion.div
      ref={ref}
      className={cn(
        "absolute select-none rounded-2xl glass-card transition-opacity",
        selected && "ring-2",
        dimmed && "opacity-30",
      )}
      style={{
        left: card.x,
        top: card.y,
        width: card.width,
        height: card.height,
        zIndex: card.z,
        ...(selected ? { boxShadow: `0 0 0 2px ${accent}, 0 24px 60px -20px oklch(0 0 0 / 0.7), 0 0 40px ${accent}55` } : {}),
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      animate={{ rotateX: tilt.rx, rotateY: tilt.ry }}
      transition={{ type: "spring", damping: 20, stiffness: 200 }}
      initial={{ scale: 0.9, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onDoubleClick={onDoubleClick}
    >
      {/* accent bar */}
      <div
        className="absolute left-0 top-0 h-full w-1 rounded-l-2xl"
        style={{ background: `linear-gradient(180deg, ${accent}, transparent)` }}
      />

      <div className="flex h-full flex-col gap-2 p-4">
        {editing ? (
          <input
            data-no-drag
            autoFocus
            value={card.title}
            onChange={(e) => updateCard(card.id, { title: e.target.value })}
            onBlur={() => setEditing(false)}
            // ADD THIS line:
            onPointerDown={(e) => e.stopPropagation()} 
            className="bg-transparent text-base font-semibold text-foreground outline-none"
          />
        ) : (
          <h3 className="text-base font-semibold text-foreground">{card.title}</h3>
        )}

        {editing ? (
          <textarea
            data-no-drag
            value={card.content}
            onChange={(e) => updateCard(card.id, { content: e.target.value })}
            placeholder="Write something... use /ai <prompt> for AI"
            // ADD THESE lines:
            onPointerDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()} 
            className="flex-1 resize-none bg-transparent text-sm text-foreground/90 outline-none placeholder:text-muted-foreground"
          />
        ) : (
          <div className="prose prose-invert prose-sm flex-1 overflow-hidden text-sm text-foreground/80">
            {card.content ? (
              <ReactMarkdown>{card.content}</ReactMarkdown>
            ) : (
              <span className="text-muted-foreground italic">Double-click to edit</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
          <span style={{ color: accent }}>● {colorStyles[card.color].tag}</span>
          <span>{new Date(card.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </motion.div>
  );
}

export const Card = memo(CardInner);
