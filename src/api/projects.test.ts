import { afterEach, describe, expect, it, vi } from "vitest";
import { createDrawing, createProject, fetchProjectById, fetchProjects } from "./projects";
import type { ProjectSummary } from "../types/projects";

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response;
}

describe("projects API client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetchProjects resolves with the parsed JSON array on a 200 response", async () => {
    const projects: ProjectSummary[] = [
      { id: "1", name: "Bridge A", folder: "Uncategorized", description: "", drawingCount: 0, lastUpdated: "just now" },
    ];
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(projects));
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchProjects();

    expect(result).toEqual(projects);
    expect(fetchMock).toHaveBeenCalledWith("/api/projects", { credentials: "include" });
  });

  it("fetchProjects throws when the response is not ok", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ error: "boom" }, 500));
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchProjects()).rejects.toThrow("API request failed: 500");
  });

  it("fetchProjects propagates a rejection when fetch itself fails (server unreachable)", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchProjects()).rejects.toThrow("Failed to fetch");
  });

  it("fetchProjectById requests the right URL and parses the response", async () => {
    const detail = { id: "1", name: "Bridge A", folder: "Uncategorized", description: "", drawings: [] };
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(detail));
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchProjectById("1");

    expect(result).toEqual(detail);
    expect(fetchMock).toHaveBeenCalledWith("/api/projects/1", { credentials: "include" });
  });

  it("createProject POSTs the input as JSON and parses the response", async () => {
    const input = { name: "New Bridge", folder: "Uncategorized", description: "" };
    const created = { id: "2", ...input, drawingCount: 0, lastUpdated: "just now" };
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(created, 201));
    vi.stubGlobal("fetch", fetchMock);

    const result = await createProject(input);

    expect(result).toEqual(created);
    expect(fetchMock).toHaveBeenCalledWith("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(input),
    });
  });

  it("createDrawing POSTs to the project's drawings endpoint and parses the response", async () => {
    const input = { title: "New drawing", angle: "Front view", status: "Draft", notes: "" };
    const created = { id: "d1", ...input };
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(created, 201));
    vi.stubGlobal("fetch", fetchMock);

    const result = await createDrawing("1", input);

    expect(result).toEqual(created);
    expect(fetchMock).toHaveBeenCalledWith("/api/projects/1/drawings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(input),
    });
  });
});
