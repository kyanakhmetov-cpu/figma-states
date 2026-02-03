import { describe, expect, it } from "vitest";
import { parseFigmaUrl } from "@/lib/figma";

describe("parseFigmaUrl", () => {
  it("parses file key and node id from standard file url", () => {
    const parsed = parseFigmaUrl(
      "https://www.figma.com/file/AbCdEFg12345/Design-System?node-id=120%3A880",
    );
    expect(parsed.isValid).toBe(true);
    expect(parsed.fileKey).toBe("AbCdEFg12345");
    expect(parsed.nodeId).toBe("120:880");
  });

  it("parses community file urls", () => {
    const parsed = parseFigmaUrl(
      "https://www.figma.com/community/file/ZyX987/Library",
    );
    expect(parsed.isValid).toBe(true);
    expect(parsed.fileKey).toBe("ZyX987");
  });

  it("rejects non-figma urls", () => {
    const parsed = parseFigmaUrl("https://example.com/file/123");
    expect(parsed.isValid).toBe(false);
  });
});
