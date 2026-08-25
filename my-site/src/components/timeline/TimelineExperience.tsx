"use client";

import { MotionConfig } from "motion/react";
import { INITIAL_PROGRESS } from "@/lib/timeline";
import { useTimelineProgress } from "@/hooks/use-timeline-progress";
import { EraCaption } from "@/components/scene/EraCaption";
import { SceneStage } from "@/components/scene/SceneStage";
import { TimelineScrubber } from "@/components/timeline/TimelineScrubber";

export function TimelineExperience() {
  const { progress, setProgress } = useTimelineProgress(INITIAL_PROGRESS);

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-dvh overflow-hidden bg-background select-none">
        <SceneStage progress={progress} />
        <EraCaption progress={progress} />
        <TimelineScrubber progress={progress} setProgress={setProgress} />
      </div>
    </MotionConfig>
  );
}
