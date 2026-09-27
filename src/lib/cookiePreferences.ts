export const COOKIE_PREFERENCE_KEY = "cvviews-optional-cookies";
export const COOKIE_PREFERENCE_UPDATED_EVENT = "cvviews-cookie-preference-updated";

export function saveCookiePreference(allowOptional: boolean) {
  window.localStorage.setItem(COOKIE_PREFERENCE_KEY, String(allowOptional));
  window.dispatchEvent(new Event(COOKIE_PREFERENCE_UPDATED_EVENT));
}