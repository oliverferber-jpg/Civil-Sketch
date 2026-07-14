import { OAuth2Client } from "google-auth-library";

const clientId = process.env.GOOGLE_CLIENT_ID;

if (!clientId) {
  throw new Error("GOOGLE_CLIENT_ID is required for Google sign-in verification");
}

const client = new OAuth2Client(clientId);

export type GoogleIdentity = {
  sub: string;
  email: string;
  name: string;
  picture?: string;
};

export async function verifyGoogleIdToken(idToken: string): Promise<GoogleIdentity> {
  const ticket = await client.verifyIdToken({ idToken, audience: clientId });
  const payload = ticket.getPayload();

  if (!payload) {
    throw new Error("Google credential had no payload");
  }

  if (!payload.email_verified) {
    throw new Error("Google account email is not verified");
  }

  if (!payload.email || !payload.name) {
    throw new Error("Google credential is missing required profile fields");
  }

  return {
    sub: payload.sub,
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
  };
}
