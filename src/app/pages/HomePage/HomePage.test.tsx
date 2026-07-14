import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "./HomePage";
import { fetchProjects } from "../../../api/projects";
import type { ProjectSummary } from "../../../types/projects";

vi.mock("../../../api/projects", () => ({
  fetchProjects: vi.fn(),
  fetchProjectById: vi.fn(),
  createProject: vi.fn(),
  createDrawing: vi.fn(),
}));

vi.mock("../../../api/auth", () => ({
  fetchCurrentUser: vi.fn().mockResolvedValue(null),
  logout: vi.fn().mockResolvedValue(undefined),
  loginDemo: vi.fn().mockResolvedValue({ id: "demo-user", name: "Demo User", email: "demo@civilsketch.dev" }),
}));

const mockedFetchProjects = vi.mocked(fetchProjects);

const sampleProjects: ProjectSummary[] = [
  { id: "1", name: "Test Bridge", folder: "Uncategorized", description: "", drawingCount: 0, lastUpdated: "just now" },
];

async function signInAsDemoUser() {
  render(<App />);
  fireEvent.click(await screen.findByText("Continue as demo user"));
}

describe("HomePage load/error/retry", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders the project list when fetchProjects resolves", async () => {
    mockedFetchProjects.mockResolvedValue(sampleProjects);

    await signInAsDemoUser();

    await waitFor(() => screen.getByText("Test Bridge"));
    expect(screen.queryByText("Could not load projects from the backend.")).toBeNull();
  });

  it("shows the error banner and a Retry button when fetchProjects rejects", async () => {
    mockedFetchProjects.mockRejectedValue(new TypeError("Failed to fetch"));

    await signInAsDemoUser();

    await waitFor(() => screen.getByText("Could not load projects from the backend."));
    expect(screen.getByText("Retry")).toBeTruthy();
  });

  it("recovers after clicking Retry once the backend is reachable again", async () => {
    mockedFetchProjects.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    mockedFetchProjects.mockResolvedValueOnce(sampleProjects);

    await signInAsDemoUser();

    await waitFor(() => screen.getByText("Could not load projects from the backend."));

    fireEvent.click(screen.getByText("Retry"));

    await waitFor(() => screen.getByText("Test Bridge"));
    expect(screen.queryByText("Could not load projects from the backend.")).toBeNull();
    expect(mockedFetchProjects).toHaveBeenCalledTimes(2);
  });
});
