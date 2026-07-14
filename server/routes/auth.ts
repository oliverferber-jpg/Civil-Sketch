import { Router } from "express";
import { verifyGoogleIdToken } from "../auth/googleVerify";
import { signSessionToken } from "../auth/session";
import { requireAuth } from "../middleware/requireAuth";
import { getUserById, upsertDemoUser, upsertUserFromGoogle } from "../services/userService";

const router = Router();

const SESSION_COOKIE = "session";
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

router.post("/google", async (req, res) => {
  const idToken = typeof req.body?.idToken === "string" ? req.body.idToken : "";

  if (!idToken) {
    res.status(400).json({ error: "idToken is required" });
    return;
  }

  try {
    const identity = await verifyGoogleIdToken(idToken);
    const user = await upsertUserFromGoogle({
      googleSub: identity.sub,
      email: identity.email,
      name: identity.name,
      picture: identity.picture,
    });

    const sessionToken = signSessionToken({ sub: user.id, email: user.email });

    res.cookie(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_MAX_AGE_MS,
    });

    res.status(200).json({ user });
  } catch (error) {
    console.error("Google sign-in verification failed", error);
    res.status(401).json({ error: "Invalid Google credential" });
  }
});

router.post("/demo", async (_req, res) => {
  if (process.env.NODE_ENV === "production") {
    res.status(404).json({ error: "Not found" });
    return;
  }

  try {
    const user = await upsertDemoUser();
    const sessionToken = signSessionToken({ sub: user.id, email: user.email });

    res.cookie(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_MAX_AGE_MS,
    });

    res.status(200).json({ user });
  } catch (error) {
    console.error("Demo sign-in failed", error);
    res.status(500).json({ error: "Could not sign in as demo user" });
  }
});

router.post("/logout", (_req, res) => {
  res.clearCookie(SESSION_COOKIE);
  res.status(200).json({ ok: true });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await getUserById(req.user!.id);

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({ user });
});

export default router;
