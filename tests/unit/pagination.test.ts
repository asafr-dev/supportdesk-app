import { describe, it, expect } from "vitest";
import { clampPagination, DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT } from "@/lib/pagination";

describe("pagination clamp", () => {
  it("applies defaults and caps", () => {
    expect(clampPagination({})).toEqual({ limit: DEFAULT_PAGE_LIMIT, offset: 0 });
    expect(clampPagination({ limit: 1, offset: 2 })).toEqual({ limit: 1, offset: 2 });
    expect(clampPagination({ limit: 10.9, offset: 3.2 })).toEqual({ limit: 10, offset: 3 });

    expect(clampPagination({ limit: 9999, offset: 0 }).limit).toBe(MAX_PAGE_LIMIT);
    expect(clampPagination({ limit: -5, offset: -1 })).toEqual({ limit: 1, offset: 0 });
  });
});
