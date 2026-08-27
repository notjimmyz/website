"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BasketballGame } from "@/components/basketball/BasketballGame";

type BasketballOverlayProps = {
  open: boolean;
};

export function BasketballOverlay({ open }: BasketballOverlayProps) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="absolute inset-0 z-[8] pointer-events-auto bg-background"
          role="dialog"
          aria-modal="true"
          aria-label="Basketball, Tonbridge"
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: reduceMotion ? 0.01 : 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <BasketballGame />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
