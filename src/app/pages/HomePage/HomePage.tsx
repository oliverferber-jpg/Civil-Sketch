import { useEffect, useState } from "react";
import { fetchCurrentUser, logout } from "../../../api/auth";
import {
  createDrawing,
  createProject,
  deleteDrawing,
  fetchProjectById,
  fetchProjects,
  renameDrawing,
} from "../../../api/projects";
import type { ProjectDetail, ProjectSummary } from "../../../types/projects";
import type { UserProfile } from "../../../types/user";
import ApiTestPage from "../ApiTestPage/ApiTestPage";
import DrawingPadPage from "../DrawingPadPage/DrawingPadPage";
import ProjectPage from "../ProjectPage/ProjectPage";
import SignInPage from "../SignInPage/SignInPage";
import StartPage from "../StartPage/StartPage";

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [view, setView] = useState<"start" | "project" | "drawing" | "api-test">("start");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectDetail | null>(null);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [projectLoading, setProjectLoading] = useState(false);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [creatingDrawing, setCreatingDrawing] = useState(false);

  useEffect(() => {
    fetchCurrentUser()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  const loadProjects = async () => {
    setProjectsLoading(true);
    setProjectsError(null);

    try {
      const data = await fetchProjects();
      setProjects(data);
    } catch (error) {
      console.error("Failed to load projects", error);
      setProjectsError("Could not load projects from the backend.");
    } finally {
      setProjectsLoading(false);
    }
  };

  const loadProjectDetail = async (projectId: string) => {
    setSelectedProjectId(projectId);
    setSelectedProject(null);
    setProjectLoading(true);
    setProjectError(null);
    setView("project");

    try {
      const data = await fetchProjectById(projectId);
      setSelectedProject(data);
    } catch (error) {
      console.error("Failed to load project detail", error);
      setProjectError("Could not load this project from the backend.");
    } finally {
      setProjectLoading(false);
    }
  };

  const handleCreateProject = async (input: {
    name: string;
    folder: string;
    description: string;
  }) => {
    await createProject(input);
    await loadProjects();
  };

  const handleCreateDrawing = async () => {
    if (!selectedProjectId || creatingDrawing) {
      return;
    }

    const name = window.prompt("Name this drawing", `New drawing ${new Date().toLocaleTimeString()}`)?.trim();
    if (!name) {
      return;
    }

    setCreatingDrawing(true);
    setProjectError(null);

    try {
      await createDrawing(selectedProjectId, {
        title: name,
        angle: "Front view",
        status: "Draft",
        notes: "",
      });

      await loadProjectDetail(selectedProjectId);
      setView("drawing");
    } catch (error) {
      console.error("Failed to create drawing", error);
      setProjectError("Could not create a new drawing.");
    } finally {
      setCreatingDrawing(false);
    }
  };

  const handleRenameDrawing = async (drawingId: string) => {
    if (!selectedProjectId || !selectedProject) {
      return;
    }

    const drawing = selectedProject.drawings.find((item) => item.id === drawingId);
    if (!drawing) {
      return;
    }

    const nextName = window.prompt("Rename drawing", drawing.title)?.trim();
    if (!nextName) {
      return;
    }

    try {
      await renameDrawing(selectedProjectId, drawingId, nextName);
      await loadProjectDetail(selectedProjectId);
      await loadProjects();
    } catch (error) {
      console.error("Failed to rename drawing", error);
      setProjectError("Could not rename this drawing.");
    }
  };

  const handleDeleteDrawing = async (drawingId: string) => {
    if (!selectedProjectId || !selectedProject) {
      return;
    }

    const drawing = selectedProject.drawings.find((item) => item.id === drawingId);
    if (!drawing) {
      return;
    }

    const confirmed = window.confirm(`Delete "${drawing.title}"? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    try {
      await deleteDrawing(selectedProjectId, drawingId);
      await loadProjectDetail(selectedProjectId);
      await loadProjects();
    } catch (error) {
      console.error("Failed to delete drawing", error);
      setProjectError("Could not delete this drawing.");
    }
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    loadProjects();
  }, [user]);

  if (!user) {
    return <SignInPage onSuccess={setUser} />;
  }

  const renderContent = () => {
    if (view === "api-test") {
      return (
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => setView("start")}
            className="w-fit rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Back to start
          </button>
          <ApiTestPage />
        </div>
      );
    }

    if (view === "drawing") {
      return <DrawingPadPage title={selectedProject?.name} onBack={() => setView("project")} />;
    }

    if (view === "project") {
      if (projectLoading) {
        return (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            Loading project details...
          </div>
        );
      }

      if (projectError) {
        return (
          <div className="flex max-w-3xl flex-col gap-4 rounded-3xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
            <p className="text-sm font-medium text-rose-700">{projectError}</p>
            <div className="flex gap-2">
              {selectedProjectId ? (
                <button
                  type="button"
                  onClick={() => loadProjectDetail(selectedProjectId)}
                  className="w-fit rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
                >
                  Retry
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setView("start")}
                className="w-fit rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Back to projects
              </button>
            </div>
          </div>
        );
      }

      if (!selectedProject) {
        return (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            Select a project to continue.
          </div>
        );
      }

      return (
        <ProjectPage
          project={selectedProject}
          onBack={() => {
            setView("start");
            setProjectError(null);
          }}
          onSelectDrawing={(drawingId) => {
            void drawingId;
            setView("drawing");
          }}
          onStartNewDrawing={handleCreateDrawing}
          onRenameDrawing={handleRenameDrawing}
          onDeleteDrawing={handleDeleteDrawing}
          creatingDrawing={creatingDrawing}
        />
      );
    }

    if (projectsLoading) {
      return (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          Loading projects...
        </div>
      );
    }

    if (projectsError) {
      return (
        <div className="flex max-w-3xl flex-col gap-4 rounded-3xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
          <p className="text-sm font-medium text-rose-700">{projectsError}</p>
          <button
            type="button"
            onClick={loadProjects}
            className="w-fit rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      );
    }

    return (
      <StartPage
        projects={projects}
        onSelectProject={loadProjectDetail}
        onCreateProject={handleCreateProject}
      />
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
        <div>
          <h2 className="m-0 text-xl font-semibold text-slate-900">CivilSketch</h2>
          <p className="mt-1 text-sm text-slate-500">Signed in as {user.name}</p>
        </div>
        <div className="flex items-center gap-2">
          {import.meta.env.DEV ? (
            <button
              onClick={() => setView("api-test")}
              className="rounded-full border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
            >
              API test
            </button>
          ) : null}
          <button
            onClick={() => {
              void logout();
              setUser(null);
              setView("start");
              setSelectedProjectId(null);
              setSelectedProject(null);
              setProjects([]);
              setProjectsError(null);
              setProjectError(null);
            }}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
          >
            Sign out
          </button>
        </div>
      </div>
      <div className="p-6">{renderContent()}</div>
    </div>
  );
}