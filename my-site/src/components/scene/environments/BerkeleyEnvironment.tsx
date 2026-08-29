"use client";

import type { EnvironmentProps } from "./types";
import { IsoBerkeleyEnvironment } from "./IsoBerkeleyEnvironment";

export function BerkeleyEnvironment(props: EnvironmentProps) {
  return <IsoBerkeleyEnvironment {...props} />;
}
