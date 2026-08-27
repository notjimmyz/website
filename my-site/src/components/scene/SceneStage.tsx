"use client";

import { motion, type MotionValue } from "motion/react";
import type { ComponentType, ReactNode } from "react";
import { ERAS, type EraId } from "@/lib/timeline";
import { BerkeleyEnvironment } from "./environments/BerkeleyEnvironment";
import { IsoTonbridgeEnvironment } from "./environments/IsoTonbridgeEnvironment";
import { NewZealandEnvironment } from "./environments/NewZealandEnvironment";
import { SanFranciscoEnvironment } from "./environments/SanFranciscoEnvironment";
import { ShanghaiEnvironment } from "./environments/ShanghaiEnvironment";
import type { EnvironmentProps } from "./environments/types";
import { useEraLayerStyle } from "./use-era-layer-style";

const ENVIRONMENTS: Record<EraId, ComponentType<EnvironmentProps>> = {
  birth: NewZealandEnvironment,
  childhood: ShanghaiEnvironment,
  sixthform: IsoTonbridgeEnvironment,
  college: BerkeleyEnvironment,
  now: SanFranciscoEnvironment,
};

type SceneStageProps = {
  progress: MotionValue<number>;
  onOpenHighStreet?: () => void;
  onOpenBasketball?: () => void;
};

export function SceneStage({
  progress,
  onOpenHighStreet,
  onOpenBasketball,
}: SceneStageProps) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {ERAS.map((era) => {
        const Environment = ENVIRONMENTS[era.id];

        return (
          <EraLayer
            key={era.id}
            progress={progress}
            at={era.at}
            allowInteraction={era.id === "childhood" || era.id === "sixthform"}
          >
            <Environment
              progress={progress}
              onOpenHighStreet={era.id === "sixthform" ? onOpenHighStreet : undefined}
              onOpenBasketball={era.id === "sixthform" ? onOpenBasketball : undefined}
            />
          </EraLayer>
        );
      })}
    </div>
  );
}

function EraLayer({
  progress,
  at,
  allowInteraction = false,
  children,
}: {
  progress: MotionValue<number>;
  at: number;
  allowInteraction?: boolean;
  children: ReactNode;
}) {
  const style = useEraLayerStyle(progress, at);

  return (
    <motion.div
      className="absolute inset-0"
      style={style}
      aria-hidden={allowInteraction ? undefined : true}
    >
      {children}
    </motion.div>
  );
}
