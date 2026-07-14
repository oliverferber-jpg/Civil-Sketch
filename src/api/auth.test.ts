import { afterEach, describe, expect, it, vi } from "vitest";
import { loginDemo } from "./auth";
import type { UserProfile } from "../types/user";

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response;
}

describe("auth API client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loginDemo POSTs to /api/auth/demo and resolves with the parsed user", async () => {
    const user: UserProfile = { id: "demo-uuid", name: "Demo User", email: "demo@civilsketch.dev" };
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ user }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await loginDemo();

    expect(result).toEqual(user);
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/demo", {
      method: "POST",
      credentials: "include",
    });
  });

  it("loginDemo throws when the response is not ok", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ error: "not found" }, 404));
    vi.stubGlobal("fetch", fetchMock);

    await expect(loginDemo()).rejects.toThrow("API request failed: 404");
  });
});
