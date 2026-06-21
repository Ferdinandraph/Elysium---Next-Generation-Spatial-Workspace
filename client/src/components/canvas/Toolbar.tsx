import { motion } from "framer-motion";
import { Plus, Focus, Download, Trash2, Sparkles, Link2, FileText, Wand2 } from "lucide-react";
import { useCanvasStore, type CardColor } from "@/lib/canvas-store";
import { toast } from "sonner";

const colors: { c: CardColor; hex: string }[] = [
  { c: "violet", hex: "oklch(0.78 0.17 295)" },
  { c: "cyan", hex: "oklch(0.78 0.15 210)" },
  { c: "rose", hex: "oklch(0.75 0.18 10)" },
  { c: "amber", hex: "oklch(0.82 0.15 75)" },
  { c: "emerald", hex: "oklch(0.75 0.15 160)" },
];

export function Toolbar() {
  const addCard = useCanvasStore((s) => s.addCard);
  const selectedIds = useCanvasStore((s) => s.selectedIds);
  const cards = useCanvasStore((s) => s.cards);
  const deleteCard = useCanvasStore((s) => s.deleteCard);
  const updateCard = useCanvasStore((s) => s.updateCard);
  const focusMode = useCanvasStore((s) => s.focusMode);
  const toggleFocusMode = useCanvasStore((s) => s.toggleFocusMode);
  const exportJSON = useCanvasStore((s) => s.exportJSON);

  const hasSelection = selectedIds.length > 0;

  const runAI = async (action: "enhance" | "summarize" | "connect" | "expand") => {
  if (!hasSelection) {
    toast.info("Select a card first");
    return;
  }
  
  const id = selectedIds[0];
  const c = cards[id];
  if (!c) return;

  // 1. Show the loading toast
  toast.loading("Elysium AI thinking...", { id: "ai" });

  try {
    // 2. Replace this URL with your production or test Webhook URL from n8n
    const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: action,
        title: c.title,
        content: c.content,
        cardId: c.id,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const data = await response.json();

    // 3. Extract the new text returned from n8n and update the store
    if (data && data.transformedContent) {
      updateCard(id, { content: data.transformedContent });
      toast.success(`${action} complete`, { id: "ai" });
    } else {
      throw new Error("Invalid response structure from AI pipeline");
    }

  } catch (error) {
    console.error("n8n AI Request Failed:", error);
    toast.error("Failed to run AI action. Check your connection.", { id: "ai" });
  }
};

  const handleExport = () => {
    const json = exportJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `elysium-canvas-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Canvas exported");
  };

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, type: "spring", damping: 20 }}
      className="pointer-events-auto fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
    >
      <div className="glass-panel flex items-center gap-1 rounded-full p-1.5">
        <ToolButton icon={<Plus className="size-4" />} label="New card (N)" onClick={() => addCard()} />

        <div className="mx-1 h-6 w-px bg-border" />

        {colors.map((c) => (
          <button
            key={c.c}
            onClick={() => {
              if (hasSelection) selectedIds.forEach((id) => updateCard(id, { color: c.c }));
              else addCard({ color: c.c });
            }}
            className="size-7 rounded-full transition-transform hover:scale-110"
            style={{ background: c.hex, boxShadow: `0 0 12px ${c.hex}80` }}
            title={c.c}
          />
        ))}

        <div className="mx-1 h-6 w-px bg-border" />

        <ToolButton icon={<Sparkles className="size-4" />} label="Enhance" onClick={() => runAI("enhance")} accent />
        <ToolButton icon={<FileText className="size-4" />} label="Summarize" onClick={() => runAI("summarize")} accent />
        <ToolButton icon={<Link2 className="size-4" />} label="Connect" onClick={() => runAI("connect")} accent />
        <ToolButton icon={<Wand2 className="size-4" />} label="Expand" onClick={() => runAI("expand")} accent />

        <div className="mx-1 h-6 w-px bg-border" />

        <ToolButton
          icon={<Focus className="size-4" />}
          label="Focus mode (F)"
          onClick={toggleFocusMode}
          active={focusMode}
        />
        <ToolButton icon={<Download className="size-4" />} label="Export (E)" onClick={handleExport} />
        <ToolButton
          icon={<Trash2 className="size-4" />}
          label="Delete"
          onClick={() => {
            selectedIds.forEach(deleteCard);
            if (selectedIds.length) toast.success("Deleted");
          }}
          danger
          disabled={!hasSelection}
        />
      </div>
    </motion.div>
  );
}

function ToolButton({
  icon,
  label,
  onClick,
  active,
  accent,
  danger,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  accent?: boolean;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`relative flex size-9 items-center justify-center rounded-full transition-all hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent ${
        active ? "bg-primary text-primary-foreground" : ""
      } ${accent ? "text-primary" : "text-foreground/80"} ${danger ? "hover:text-destructive" : ""}`}
    >
      {icon}
    </button>
  );
}
