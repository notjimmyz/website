"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { TonbridgeEnvironment } from "./environments/TonbridgeEnvironment";

type HighStreetOverlayProps = {
  open: boolean;
};

export function HighStreetOverlay({ open }: HighStreetOverlayProps) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="absolute inset-0 z-[8] pointer-events-auto"
          role="dialog"
          aria-modal="true"
          aria-label="High Street, Tonbridge"
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: reduceMotion ? 0.01 : 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <TonbridgeEnvironment />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
