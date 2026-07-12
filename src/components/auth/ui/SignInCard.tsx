import { useEffect, useRef, useState } from "react";

type UserProfile = {
  name: string;
  email: string;
  picture?: string;
};

type SignInPageProps = {
  onSuccess: (user: UserProfile) => void;
};

export default function SignInPage({ onSuccess }: SignInPageProps) {
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    "idle"
  );
  const [message, setMessage] = useState(
    "Sign in to continue to CivilSketch."
  );

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) {
      setStatus("ready");
      setMessage("Google sign-in is not configured yet. Use demo access to preview the experience.");
      return;
    }

    setStatus("loading");

    const scriptId = "google-gsi-script";

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id) {
        setStatus("error");
        setMessage("Google sign-in could not be initialized. Please try again later.");
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: { credential?: string }) => {
          if (!response.credential) {
            setStatus("error");
            setMessage("Google sign-in was canceled.");
            return;
          }

          try {
            const payload = JSON.parse(
              atob(response.credential.split(".")[1])
            ) as {
              name?: string;
              email?: string;
              picture?: string;
            };

            onSuccess({
              name: payload.name ?? "Google User",
              email: payload.email ?? "unknown@example.com",
              picture: payload.picture,
            });
          } catch {
            setStatus("error");
            setMessage("We could not read your Google profile. Please try again.");
          }
        },
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        text: "signin_with",
        shape: "rectangular",
      });

      setStatus("ready");
      setMessage("Continue with your Google account.");
    };

    if (document.getElementById(scriptId)) {
      initializeGoogle();
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    script.onerror = () => {
      setStatus("error");
      setMessage("The Google sign-in script could not be loaded.");
    };

    document.body.appendChild(script);
  }, [clientId, onSuccess]);

  const handleDemoSignIn = () => {
    onSuccess({
      name: "Demo User",
      email: "demo@civilsketch.dev",
      picture: undefined,
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
        padding: "24px",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "rgba(255,255,255,0.95)",
          borderRadius: "24px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          padding: "36px 28px",
        }}
      >
        <div style={{ marginBottom: "18px" }}>
          <p
            style={{
              margin: 0,
              color: "#2563eb",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              fontSize: "0.8rem",
            }}
          >
            CivilSketch
          </p>
          <h1 style={{ margin: "8px 0 10px", fontSize: "1.9rem", color: "#111827" }}>
            Welcome back
          </h1>
          <p style={{ margin: 0, color: "#4b5563", lineHeight: 1.5 }}>
            {message}
          </p>
        </div>

        <div style={{ marginTop: "22px" }}>
          {clientId ? (
            <div
              ref={buttonRef}
              style={{ display: "flex", justifyContent: "center" }}
            />
          ) : (
            <button
              onClick={handleDemoSignIn}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "999px",
                border: "none",
                background: "#2563eb",
                color: "white",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Continue as demo user
            </button>
          )}
        </div>

        <div
          style={{
            marginTop: "18px",
            fontSize: "0.9rem",
            color: "#6b7280",
            textAlign: "center",
          }}
        >
          {status === "loading" && "Loading Google sign-in..."}
          {status === "error" && "Authentication could not be completed."}
          {status === "ready" && "Secure sign-in with Google"}
        </div>
      </div>
    </div>
  );
}
