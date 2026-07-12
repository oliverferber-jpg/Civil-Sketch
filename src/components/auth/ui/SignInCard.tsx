import { useEffect, useState } from "react";

type UserProfile = {
  name: string;
  email: string;
  picture?: string;
};

type SignInPageProps = {
  onSuccess: (user: UserProfile) => void;
};

export default function SignInPage({ onSuccess }: SignInPageProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    "idle"
  );
  const [message, setMessage] = useState(
    "Sign in to continue to CivilSketch."
  );

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const backendBaseUrl =
    import.meta.env.VITE_BACKEND_URL ??
    import.meta.env.VITE_API_BASE_URL ??
    "http://localhost:3000";
  const authEndpoint = `${backendBaseUrl.replace(/\/$/, "")}/auth/google`;

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

  const handleGoogleSignIn = async () => {
    setStatus("loading");
    setMessage("Sending sign-in request to the backend...");

    try {
      const response = await fetch(authEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ provider: "google" }),
      });

      if (!response.ok) {
        throw new Error("backend_request_failed");
      }

      const data = (await response.json()) as {
        user?: { name?: string; email?: string; picture?: string };
      };

      const user = data.user;

      if (user) {
        onSuccess({
          name: user.name ?? "Google User",
          email: user.email ?? "unknown@example.com",
          picture: user.picture,
        });
        return;
      }

      throw new Error("missing_user_payload");
    } catch {
      setStatus("error");
      setMessage("The backend sign-in request could not be completed.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-blue-900 to-slate-800 p-6 font-sans">
      <div className="w-full max-w-md rounded-3xl bg-white/95 p-8 shadow-2xl shadow-slate-950/25">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
            CivilSketch
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Welcome back</h1>
          <p className="mt-2 leading-6 text-slate-600">{message}</p>
        </div>

        <div className="mt-6">
          <button
            onClick={handleGoogleSignIn}
            disabled={status === "loading"}
            className="w-full rounded-full bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {clientId ? "Sign in with Google" : "Sign in with Google"}
          </button>
        </div>

        <div className="mt-4 text-center text-sm text-slate-500">
          {status === "loading" && "Loading Google sign-in..."}
          {status === "error" && "Authentication could not be completed."}
          {status === "ready" && "Secure sign-in with Google"}
        </div>
      </div>
    </div>
  );
}
