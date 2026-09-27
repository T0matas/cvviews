export interface StoredUser {
  name: string;
  email: string;
}

export const USER_STORAGE_KEY = "cvviews-user";
export const ANALYSIS_STORAGE_KEY = "cvviews-analyses";

export function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;

  const value = window.localStorage.getItem(USER_STORAGE_KEY);
  if (!value) return null;

  try {
    return JSON.parse(value) as StoredUser;
  } catch {
    window.localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

export function setStoredUser(user: StoredUser) {
  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("cvviews-auth-change"));
}

export function clearStoredUser() {
  window.localStorage.removeItem(USER_STORAGE_KEY);
  window.dispatchEvent(new Event("cvviews-auth-change"));
}