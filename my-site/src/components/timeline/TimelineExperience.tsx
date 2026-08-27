"use client";

import { MotionConfig } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import {
  BASKETBALL_CHAPTER,
  eraAt,
  HIGH_STREET_CHAPTER,
  INITIAL_PROGRESS,
  type NestedChapter,
} from "@/lib/timeline";
import { useTimelineProgress } from "@/hooks/use-timeline-progress";
import { BasketballOverlay } from "@/components/scene/BasketballOverlay";
import { EraCaption } from "@/components/scene/EraCaption";
import { HighStreetOverlay } from "@/components/scene/HighStreetOverlay";
import { SceneStage } from "@/components/scene/SceneStage";
import { TimelineScrubber } from "@/components/timeline/TimelineScrubber";

export function TimelineExperience() {
  const { progress, setProgress } = useTimelineProgress(INITIAL_PROGRESS);
  const [nestedId, setNestedId] = useState<NestedChapter["id"] | null>(null);

  const nested =
    nestedId === "high-street"
      ? HIGH_STREET_CHAPTER
      : nestedId === "basketball"
        ? BASKETBALL_CHAPTER
        : null;

  const openHighStreet = useCallback(() => {
    setNestedId("high-street");
  }, []);

  const openBasketball = useCallback(() => {
    setNestedId("basketball");
  }, []);

  const backToSixthForm = useCallback(() => {
    setNestedId(null);
    setProgress(eraAt("sixthform"));
  }, [setProgress]);

  useEffect(() => {
    if (!nestedId) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        backToSixthForm();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [nestedId, backToSixthForm]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-dvh overflow-hidden bg-background select-none">
        <SceneStage
          progress={progress}
          onOpenHighStreet={openHighStreet}
          onOpenBasketball={openBasketball}
        />
        <HighStreetOverlay open={nestedId === "high-street"} />
        <BasketballOverlay open={nestedId === "basketball"} />
        <EraCaption
          progress={progress}
          nested={nested}
          onBack={backToSixthForm}
        />
        {nestedId ? null : (
          <TimelineScrubber progress={progress} setProgress={setProgress} />
        )}
      </div>
    </MotionConfig>
  );
}
