import { useState } from "react";
import DrawingPadPage from "../DrawingPadPage/DrawingPadPage";
import ProjectPage from "../ProjectPage/ProjectPage";
import SignInPage from "../SignInPage/SignInPage";
import StartPage from "../StartPage/StartPage";

type UserProfile = {
  name: string;
  email: string;
  picture?: string;
};

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [view, setView] = useState<"start" | "project" | "drawing">("start");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const projects = [
    {
      id: "project-1",
      name: "Riverfront Residence",
      folder: "Residential",
      description: "Concept sketches for a modern riverside home.",
      drawingCount: 4,
      lastUpdated: "2 days ago",
    },
    {
      id: "project-2",
      name: "Harbor Studio",
      folder: "Commercial",
      description: "Facade studies and interior planning for a creative studio.",
      drawingCount: 3,
      lastUpdated: "1 week ago",
    },
    {
      id: "project-3",
      name: "Cedar Cabin",
      folder: "Residential",
      description: "Site and elevation sketches for a small cabin retreat.",
      drawingCount: 2,
      lastUpdated: "3 weeks ago",
    },
  ];

  const projectDetails = {
    "project-1": {
      id: "project-1",
      name: "Riverfront Residence",
      folder: "Residential",
      description: "Concept sketches for a modern riverside home.",
      drawings: [
        {
          id: "drawing-1",
          title: "North Elevation",
          angle: "Front view",
          status: "In progress",
          updatedAt: "2h ago",
          notes: "Refine the roofline and window rhythm.",
        },
        {
          id: "drawing-2",
          title: "Kitchen Layout",
          angle: "Interior perspective",
          status: "Draft",
          updatedAt: "Yesterday",
          notes: "Add cabinetry and island dimensions.",
        },
      ],
    },
    "project-2": {
      id: "project-2",
      name: "Harbor Studio",
      folder: "Commercial",
      description: "Facade studies and interior planning for a creative studio.",
      drawings: [
        {
          id: "drawing-3",
          title: "Facade Study",
          angle: "Street view",
          status: "Reviewed",
          updatedAt: "4 days ago",
          notes: "Final review for the glazing pattern.",
        },
      ],
    },
    "project-3": {
      id: "project-3",
      name: "Cedar Cabin",
      folder: "Residential",
      description: "Site and elevation sketches for a small cabin retreat.",
      drawings: [
        {
          id: "drawing-4",
          title: "Site Plan",
          angle: "Top view",
          status: "Draft",
          updatedAt: "1 week ago",
          notes: "Place the patio and access path.",
        },
      ],
    },
  } as const;

  const selectedProject = selectedProjectId
    ? projectDetails[selectedProjectId as keyof typeof projectDetails]
    : null;

  if (!user) {
    return <SignInPage onSuccess={setUser} />;
  }

  const renderContent = () => {
    if (view === "drawing") {
      return <DrawingPadPage title={selectedProject?.name} onBack={() => setView("project")} />;
    }

    if (view === "project" && selectedProject) {
      return (
        <ProjectPage
          project={selectedProject}
          onBack={() => setView("start")}
          onSelectDrawing={() => setView("drawing")}
          onStartNewDrawing={() => setView("drawing")}
        />
      );
    }

    return (
      <StartPage
        projects={projects}
        onSelectProject={(projectId) => {
          setSelectedProjectId(projectId);
          setView("project");
        }}
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
        <button
          onClick={() => {
            setUser(null);
            setView("start");
            setSelectedProjectId(null);
          }}
          className="rounded-full border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
        >
          Sign out
        </button>
      </div>
      <div className="p-6">{renderContent()}</div>
    </div>
  );
}