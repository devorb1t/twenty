// Parses the `PRE_INSTALLED_APPS` env string into a list of npm package
// names. Shared between the config validator (at startup-time) and
// PreInstalledAppsService (at runtime) so the two code paths can't drift
// on whitespace/empty handling.
export const parsePreInstalledApps = (raw: string | undefined): string[] =>
  (raw ?? '')
    .split(',')
    .map((name) => name.trim())
    .filter((name) => name.length > 0);
