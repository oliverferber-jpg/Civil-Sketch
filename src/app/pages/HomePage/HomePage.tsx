import { useState } from "react";
import DrawingPadPage from "../DrawingPadPage/DrawingPadPage";
import SignInPage from "../SignInPage/SignInPage";

type UserProfile = {
  name: string;
  email: string;
  picture?: string;
};

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);

  if (!user) {
    return <SignInPage onSuccess={setUser} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
        <div>
          <h2 className="m-0 text-xl font-semibold text-slate-900">CivilSketch</h2>
          <p className="mt-1 text-sm text-slate-500">Signed in as {user.name}</p>
        </div>
        <button
          onClick={() => setUser(null)}
          className="rounded-full border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
        >
          Sign out
        </button>
      </div>
      <div className="p-6">
        <DrawingPadPage />
      </div>
    </div>
  );
}