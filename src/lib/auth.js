import { createAuthClient } from "better-auth/react";

const authUrl = import.meta.env.VITE_NEON_AUTH_URL || "https://ep-super-dawn-acje1190.neonauth.sa-east-1.aws.neon.tech/neondb/auth";

export const authClient = createAuthClient({
  baseURL: authUrl
});

const LOCAL_STORAGE_SESSION_KEY = "ale_nutri_session_user";

/**
 * Save active user session locally
 */
export function saveLocalSession(user) {
  if (user) {
    localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
  }
}

/**
 * Get active user session locally
 */
export function getLocalSession() {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    return null;
  }
}

/**
 * Clear user session locally
 */
export function clearLocalSession() {
  localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
}
