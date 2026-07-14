import type { UserProfile } from "../types/user";
import { parseJsonResponse } from "./http";

export async function loginWithGoogle(idToken: string): Promise<UserProfile> {
  const response = await fetch("/api/auth/google", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ idToken }),
  });

  const { user } = await parseJsonResponse<{ user: UserProfile }>(response);
  return user;
}

export async function fetchCurrentUser(): Promise<UserProfile | null> {
  const response = await fetch("/api/auth/me", {
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  const { user } = await parseJsonResponse<{ user: UserProfile }>(response);
  return user;
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}
