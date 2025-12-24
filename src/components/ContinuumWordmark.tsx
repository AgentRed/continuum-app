import React from "react";
import ContinuumWordmarkV1 from "./ContinuumWordmarkV1";
import ContinuumWordmarkV2 from "./ContinuumWordmarkV2";

// Rollback: Change this to "v1" to use the classic wordmark
const WORDMARK_VARIANT: "v1" | "v2" = "v2";

export default function ContinuumWordmark() {
  if (WORDMARK_VARIANT === "v1") {
    return <ContinuumWordmarkV1 />;
  }
  return <ContinuumWordmarkV2 />;
}
