import { motion } from "framer-motion";

export function AmbientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Aurora blobs */}
      <motion.div
        className="absolute -top-1/4 -left-1/4 h-[60vw] w-[60vw] rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--color-aurora-1), transparent 70%)" }}
        animate={{ x: [0, 80, -40, 0], y: [0, 60, -30, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -top-1/4 -right-1/4 h-[55vw] w-[55vw] rounded-full opacity-35 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--color-aurora-2), transparent 70%)" }}
        animate={{ x: [0, -60, 40, 0], y: [0, 40, -50, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-1/4 left-1/3 h-[50vw] w-[50vw] rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--color-aurora-3), transparent 70%)" }}
        animate={{ x: [0, 50, -50, 0], y: [0, -40, 30, 0] }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Grain */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
