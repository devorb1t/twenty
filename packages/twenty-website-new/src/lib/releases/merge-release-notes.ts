import type { LocalReleaseNote } from '@/lib/releases/types';
import { compareSemanticVersions } from '@/lib/semver/compare-semantic-versions';

// Merges locally-authored MDX release notes with GitHub release data.
// Local MDX takes priority when both exist for the same version.
// GitHub releases that have no local MDX counterpart are included as fallback
// so the releases page stays up-to-date even before hand-written notes are added.
export function mergeLocalAndGithubReleaseNotes(
  localNotes: LocalReleaseNote[],
  githubNotes: LocalReleaseNote[],
): LocalReleaseNote[] {
  const localVersions = new Set(localNotes.map((note) => note.release));

  const githubOnlyNotes = githubNotes.filter(
    (note) => !localVersions.has(note.release),
  );

  const merged = [...localNotes, ...githubOnlyNotes];

  merged.sort((a, b) => compareSemanticVersions(b.release, a.release));

  return merged;
}
