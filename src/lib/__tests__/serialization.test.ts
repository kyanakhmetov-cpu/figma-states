import { describe, expect, it } from "vitest";
import { serializeStatesText, stateCopyText } from "@/lib/serialization";

const baseState = {
  id: "state-1",
  elementId: "element-1",
  title: "Invalid email",
  message: "Enter a valid email address.",
  condition: null,
  severity: null,
  locale: "en",
  sortOrder: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("serialization helpers", () => {
  it("formats single state copy", () => {
    const messageOnly = stateCopyText(baseState, "message");
    const titleMessage = stateCopyText(baseState, "title-message");
    expect(messageOnly).toBe("Enter a valid email address.");
    expect(titleMessage).toBe("Invalid email: Enter a valid email address.");
  });

  it("groups states by type in plain text export", () => {
    const text = serializeStatesText([
      { ...baseState, id: "1", type: "error" },
      {
        ...baseState,
        id: "2",
        type: "warning",
        title: "Caps lock",
        message: "Caps Lock is on.",
        sortOrder: 2,
      },
    ]);

    expect(text).toContain("ERROR");
    expect(text).toContain("WARNING");
    expect(text).toContain("Invalid email: Enter a valid email address.");
    expect(text).toContain("Caps lock: Caps Lock is on.");
  });
});
