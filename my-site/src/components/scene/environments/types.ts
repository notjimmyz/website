import type { MotionValue } from "motion/react";

export type EnvironmentProps = {
  progress: MotionValue<number>;
  onOpenHighStreet?: () => void;
  onOpenBasketball?: () => void;
  onOpenTennis?: () => void;
};
