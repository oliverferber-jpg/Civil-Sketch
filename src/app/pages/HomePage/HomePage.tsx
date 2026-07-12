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
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          background: "#f8fafc",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div>
          <h2 style={{ margin: 0, color: "#111827" }}>CivilSketch</h2>
          <p style={{ margin: "4px 0 0", color: "#6b7280" }}>
            Signed in as {user.name}
          </p>
        </div>
        <button
          onClick={() => setUser(null)}
          style={{
            border: "1px solid #d1d5db",
            background: "white",
            borderRadius: "999px",
            padding: "8px 14px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Sign out
        </button>
      </div>
      <DrawingPadPage />
    </div>
  );
}