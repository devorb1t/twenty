import axios from 'axios';

import type { LocalReleaseNote } from '@/lib/releases/types';
import { compareSemanticVersions } from '@/lib/semver/compare-semantic-versions';

type GithubRelease = {
  tag_name: string;
  published_at: string;
  body: string | null;
};

export async function fetchGithubReleases(): Promise<LocalReleaseNote[]> {
  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const response = await axios.get<GithubRelease[]>(
      'https://api.github.com/repos/twentyhq/twenty/releases?per_page=100',
      { headers },
    );

    const notes: LocalReleaseNote[] = [];

    for (const release of response.data) {
      const version = release.tag_name.replace(/^v/, '');
      const date = release.published_at
        ? release.published_at.split('T')[0]
        : '';

      notes.push({
        slug: version,
        date,
        release: version,
        content: release.body ?? '',
      });
    }

    notes.sort((a, b) => compareSemanticVersions(b.release, a.release));

    return notes;
  } catch {
    return [];
  }
}
