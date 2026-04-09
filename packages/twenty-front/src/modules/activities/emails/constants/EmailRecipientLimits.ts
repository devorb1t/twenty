// Maximum total recipients (To + Cc + Bcc) allowed per outbound email.
// Mirrors `MAX_EMAIL_RECIPIENTS` in twenty-server (email-tool.constants.ts).
// Surfaced on the frontend so the composer can disable Send and warn the user
// before the request is rejected by the backend.
export const MAX_EMAIL_RECIPIENTS = 100;
