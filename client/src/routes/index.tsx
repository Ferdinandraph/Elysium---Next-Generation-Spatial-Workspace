import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { AmbientBackground } from "@/components/canvas/AmbientBackground";
import { CursorGlow } from "@/components/canvas/CursorGlow";
import { Canvas } from "@/components/canvas/Canvas";
import { Toolbar } from "@/components/canvas/Toolbar";
import { TopBar } from "@/components/canvas/TopBar";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Elysium — Spatial Workspace" },
      {
        name: "description",
        content:
          "An infinite 2.5D AI-powered canvas to organize thoughts, notes, tasks, and ideas with premium animations and depth.",
      },
      { property: "og:title", content: "Elysium — Spatial Workspace" },
      {
        property: "og:description",
        content:
          "An infinite 2.5D AI-powered canvas to organize thoughts, notes, tasks, and ideas with premium animations and depth.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-background">
      <AmbientBackground />
      <Canvas />
      <CursorGlow />
      <TopBar />
      <Toolbar />
      <Toaster theme="dark" position="top-center" />
    </main>
  );
}
