// Map Firebase auth error codes to friendly messages shown in the UI.
const ERROR_MESSAGES = {
  "auth/email-already-in-use": "This email is already in use",
  "auth/invalid-email": "Please enter a valid email address",
  "auth/weak-password": "Your password should be 6 or more characters",
  "auth/missing-password": "Please enter your password",
  "auth/invalid-credential": "Invalid email or password. Try again.",
  "auth/invalid-login-credentials": "Invalid email or password. Try again.",
  "auth/wrong-password": "Invalid email or password. Try again.",
  "auth/user-not-found": "No account found with that email",
  "auth/user-disabled": "This account has been disabled",
  "auth/too-many-requests": "Too many attempts. Please try again later",
  "auth/popup-closed-by-user": "Sign-in was cancelled before completion",
  "auth/popup-blocked": "Please allow popups to sign in"
};

export default function formatAuthError(error) {
  if (!error) return "Something went wrong. Please try again.";

  const code = typeof error === "string" ? error : error.code;
  const friendly = ERROR_MESSAGES[code];

  return friendly || error.message || "Something went wrong. Please try again.";
}
