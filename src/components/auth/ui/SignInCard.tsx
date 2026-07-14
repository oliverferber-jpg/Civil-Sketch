import { useEffect, useRef, useState } from "react";
import { loginDemo, loginWithGoogle } from "../../../api/auth";
import type { UserProfile } from "../../../types/user";

type SignInPageProps = {
  onSuccess: (user: UserProfile) => void;
};

export default function SignInPage({ onSuccess }: SignInPageProps) {
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    clientId ? "loading" : "ready"
  );
  const [message, setMessage] = useState(
    clientId
      ? "Sign in to continue to CivilSketch."
      : "Google sign-in is not configured yet. Use demo access below to preview the experience."
  );

  useEffect(() => {
    if (!clientId) {
      return;
    }

    const scriptId = "google-gsi-script";

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id) {
        setStatus("error");
        setMessage("Google sign-in could not be initialized. Please try again later.");
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: { credential?: string }) => {
          if (!response.credential) {
            setStatus("error");
            setMessage("Google sign-in was canceled.");
            return;
          }

          try {
            const user = await loginWithGoogle(response.credential);
            onSuccess(user);
          } catch {
            setStatus("error");
            setMessage("We could not verify your Google sign-in. Please try again.");
          }
        },
      });

      if (buttonRef.current) {
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          text: "signin_with",
          shape: "rectangular",
          width: 320,
        });
      }

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

  const handleDemoSignIn = async () => {
    try {
      const user = await loginDemo();
      onSuccess(user);
    } catch {
      setStatus("error");
      setMessage("We could not sign you in as a demo user. Please try again.");
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

        <div className="mt-6 flex flex-col gap-3">
          {clientId && <div ref={buttonRef} className="flex justify-center" />}

          <button
            onClick={handleDemoSignIn}
            className="w-full rounded-full bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Continue as demo user
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
