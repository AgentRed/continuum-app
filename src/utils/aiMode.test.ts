import { describe, it, expect } from "vitest";
import {
  checkGovernedActionAllowed,
  checkActionAllowed,
  GOVERNED_ACTIONS,
  type AIMode,
} from "./aiMode";

describe("checkGovernedActionAllowed", () => {
  it("should allow actions in GOVERNED mode", () => {
    const result = checkGovernedActionAllowed("GOVERNED");
    expect(result).toBeNull();
  });

  it("should block actions in GUARDED mode", () => {
    const result = checkGovernedActionAllowed("GUARDED");
    expect(result).toBeTruthy();
    expect(result).toContain("NOT_READY");
    expect(result).toContain("govern Workspace Canon and Scope Boundaries");
  });

  it("should include reasons in GUARDED mode message", () => {
    const reasons = ["Workspace Canon missing", "Scope Boundaries not governed"];
    const result = checkGovernedActionAllowed("GUARDED", reasons);
    expect(result).toContain("NOT_READY");
    expect(result).toContain("Workspace Canon missing");
    expect(result).toContain("Scope Boundaries not governed");
  });

  it("should return base message when no reasons provided", () => {
    const result = checkGovernedActionAllowed("GUARDED", []);
    expect(result).toBeTruthy();
    expect(result).not.toContain("Current issues");
  });
});

describe("checkActionAllowed", () => {
  it("should allow all governed actions in GOVERNED mode", () => {
    const actions = Object.values(GOVERNED_ACTIONS);
    for (const action of actions) {
      const result = checkActionAllowed("GOVERNED", action);
      expect(result).toBeNull();
    }
  });

  it("should block all governed actions in GUARDED mode", () => {
    const actions = Object.values(GOVERNED_ACTIONS);
    for (const action of actions) {
      const result = checkActionAllowed("GUARDED", action, ["Test reason"]);
      expect(result).toBeTruthy();
      expect(result).toContain("NOT_READY");
    }
  });

  it("should include reasons for blocked actions", () => {
    const reasons = ["Workspace Canon not governed"];
    const result = checkActionAllowed(
      "GUARDED",
      GOVERNED_ACTIONS.CREATE_CANON_DOC,
      reasons
    );
    expect(result).toContain("Workspace Canon not governed");
  });
});
