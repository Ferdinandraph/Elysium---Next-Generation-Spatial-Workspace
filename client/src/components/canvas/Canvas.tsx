import { useEffect, useRef } from "react";
import { useCanvasStore } from "@/lib/canvas-store";
import { Card } from "./Card";

export function Canvas() {
  const cards = useCanvasStore((s) => s.cards);
  const viewport = useCanvasStore((s) => s.viewport);
  const setViewport = useCanvasStore((s) => s.setViewport);
  const selectedIds = useCanvasStore((s) => s.selectedIds);
  const clearSelection = useCanvasStore((s) => s.clearSelection);
  const addCard = useCanvasStore((s) => s.addCard);
  const focusMode = useCanvasStore((s) => s.focusMode);
  const containerRef = useRef<HTMLDivElement>(null);
  const panRef = useRef<{ mx: number; my: number; vx: number; vy: number } | null>(null);

  // wheel zoom + pan
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        const { viewport: vp } = useCanvasStore.getState();
        const rect = el.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const delta = -e.deltaY * 0.002;
        const newScale = Math.min(2.5, Math.max(0.2, vp.scale * (1 + delta)));
        const ratio = newScale / vp.scale;
        setViewport({
          scale: newScale,
          x: mx - (mx - vp.x) * ratio,
          y: my - (my - vp.y) * ratio,
        });
      } else {
        const { viewport: vp } = useCanvasStore.getState();
        setViewport({ x: vp.x - e.deltaX, y: vp.y - e.deltaY });
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [setViewport]);

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT" || (e.target as HTMLElement)?.tagName === "TEXTAREA")
        return;
      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        addCard();
      } else if (e.key === "f" || e.key === "F") {
        useCanvasStore.getState().toggleFocusMode();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        useCanvasStore.getState().selectedIds.forEach((id) => useCanvasStore.getState().deleteCard(id));
      } else if (e.key === "Escape") {
        clearSelection();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [addCard, clearSelection]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.target !== e.currentTarget && !(e.target as HTMLElement).hasAttribute("data-canvas-bg")) return;
    clearSelection();
    panRef.current = { mx: e.clientX, my: e.clientY, vx: viewport.x, vy: viewport.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!panRef.current) return;
    setViewport({
      x: panRef.current.vx + (e.clientX - panRef.current.mx),
      y: panRef.current.vy + (e.clientY - panRef.current.my),
    });
  };
  const onPointerUp = (e: React.PointerEvent) => {
    panRef.current = null;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const onDoubleClick = (e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).hasAttribute("data-canvas-bg")) return;
    const x = (e.clientX - viewport.x) / viewport.scale - 140;
    const y = (e.clientY - viewport.y) / viewport.scale - 90;
    addCard({ x, y });
  };

  return (
    <div
      ref={containerRef}
      data-canvas-bg
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onDoubleClick={onDoubleClick}
      style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, oklch(1 0 0 / 0.08) 1px, transparent 0)`,
        backgroundSize: `${32 * viewport.scale}px ${32 * viewport.scale}px`,
        backgroundPosition: `${viewport.x}px ${viewport.y}px`,
      }}
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
        }}
      >
        {Object.values(cards).map((c) => (
          <Card
            key={c.id}
            card={c}
            selected={selectedIds.includes(c.id)}
            dimmed={focusMode && selectedIds.length > 0 && !selectedIds.includes(c.id)}
            scale={viewport.scale}
          />
        ))}
      </div>
    </div>
  );
}
