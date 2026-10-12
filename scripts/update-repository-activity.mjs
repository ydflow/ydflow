import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

const START = '<!--START_SECTION:activity-->';
const END = '<!--END_SECTION:activity-->';

export function queries(username, repository = '') {
  const scope = `author:${username} is:public${repository ? ` repo:${repository}` : ''}`;
  return {
    commits: `${scope}`,
    opened: `${scope} is:pr`,
    merged: `${scope} is:pr is:merged`,
  };
}

// Space requests below GitHub's authenticated search limit (30 per minute).
export function createSearch() {
  let lastRequest = 0;
  return async (endpoint, query, sort, page = 1) => {
    for (let attempt = 0; attempt < 3; attempt++) {
      await delay(Math.max(0, 2200 - (Date.now() - lastRequest)));
      lastRequest = Date.now();
      try {
        const params = new URLSearchParams({ q: query, sort, order: 'desc', per_page: '100', page: String(page) });
        const output = execFileSync('gh', ['api', `search/${endpoint}?${params}`, '-H', 'Accept: application/vnd.github+json'], {
          encoding: 'utf8', timeout: 60000, stdio: ['ignore', 'pipe', 'pipe'],
        });
        const result = JSON.parse(output);
        if (result.incomplete_results || !Number.isInteger(result.total_count) || !Array.isArray(result.items)) {
          throw new Error('GitHub returned incomplete search results');
        }
        return result;
      } catch (error) {
        if (attempt === 2) throw error;
        await delay(5000 * (attempt + 1));
      }
    }
  };
}

function repositoryOf(item, kind) {
  return kind === 'commits' ? item.repository.full_name : new URL(item.repository_url).pathname.slice('/repos/'.length);
}

function contributionDate(item, kind) {
  if (kind === 'commits') return Date.parse(item.commit.author.date);
  if (kind === 'merged') return Date.parse(item.pull_request.merged_at);
  return Date.parse(item.created_at);
}

function streamDate(item, kind) {
  // Search cannot sort PRs by merge time. Updated time is an upper bound,
  // so paginate until even that upper bound is older than the eighth repo.
  return kind === 'merged' ? Date.parse(item.updated_at) : contributionDate(item, kind);
}

export async function recentRepositories(search, username, limit = 8, excluded = `${username}/${username}`) {
  const candidates = new Map();
  const commits = new Map();
  const query = queries(username);
  const feeds = [
    { kind: 'commits', endpoint: 'commits', sort: 'author-date' },
    { kind: 'opened', endpoint: 'issues', sort: 'created' },
    { kind: 'merged', endpoint: 'issues', sort: 'updated' },
  ].map(feed => ({ ...feed, page: 1, done: false }));
  const ranked = () => {
    const verified = new Map(candidates);
    // Commit search includes mirrors that copied this user's commits. Only
    // use owned repos or actual PR targets as evidence of participation.
    for (const [repository, when] of commits) {
      if (repository.toLowerCase().startsWith(`${username.toLowerCase()}/`) || candidates.has(repository)) {
        verified.set(repository, Math.max(verified.get(repository) ?? 0, when));
      }
    }
    return [...verified.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  };

  while (feeds.some(feed => !feed.done)) {
    for (const feed of feeds.filter(feed => !feed.done)) {
      const result = await search(feed.endpoint, query[feed.kind], feed.sort, feed.page);
      if (result.incomplete_results) throw new Error('Incomplete repository discovery');
      for (const item of result.items) {
        const repository = repositoryOf(item, feed.kind);
        const when = contributionDate(item, feed.kind);
        if (repository.toLowerCase() === excluded.toLowerCase()) continue;
        if (!Number.isFinite(when)) throw new Error('Missing contribution date');
        const collection = feed.kind === 'commits' ? commits : candidates;
        collection.set(repository, Math.max(collection.get(repository) ?? 0, when));
      }
      const repos = ranked();
      const last = result.items.at(-1);
      const cutoff = repos.length >= limit ? repos[limit - 1][1] : -Infinity;
      // Read all authored PR targets, including older PRs whose repo may
      // have a newer direct commit. This establishes mirror-free provenance.
      const covered = feed.kind !== 'opened' && last && streamDate(last, feed.kind) < cutoff;
      const exhausted = feed.page * 100 >= result.total_count || result.items.length === 0;
      feed.done = covered || exhausted;
      if (!feed.done && feed.page === 10) throw new Error('Repository discovery exceeded GitHub search pagination; keeping README unchanged');
      feed.page++;
    }
  }
  return ranked().slice(0, limit).map(([repository]) => repository);
}

export async function repositoryTotals(search, username, repositories) {
  const rows = [];
  for (const repository of repositories) {
    const query = queries(username, repository);
    const row = { repository };
    for (const kind of ['commits', 'opened', 'merged']) {
      const result = await search(kind === 'commits' ? 'commits' : 'issues', query[kind], kind === 'commits' ? 'author-date' : 'created');
      if (result.incomplete_results || !Number.isInteger(result.total_count)) throw new Error('Incomplete contribution counts');
      // total_count is the lifetime count, even if more than 1,000 items match.
      row[kind] = result.total_count;
    }
    rows.push(row);
  }
  return rows;
}

export function renderTable(rows, username) {
  if (!rows.length) return '暂无可展示的公开仓库贡献。';
  const lines = [
    '最近参与的公开仓库 · 累计贡献',
    '',
    '| 仓库 | 代码提交 | 发起 PR | 已合并 PR |',
    '| :--- | ---: | ---: | ---: |',
  ];
  for (const row of rows) {
    const query = queries(username, row.repository);
    const countLink = kind => `[${row[kind]}](https://github.com/search?q=${encodeURIComponent(query[kind])}&type=${kind === 'commits' ? 'commits' : 'pullrequests'})`;
    lines.push(`| [${row.repository}](https://github.com/${row.repository}) | ${countLink('commits')} | ${countLink('opened')} | ${countLink('merged')} |`);
  }
  lines.push('', '<sub>均为本人累计贡献，不限时间；代码提交统计默认分支，PR 分别统计发起数与已合并数。不含本主页仓库，点击数字可查看记录。</sub>');
  return lines.join('\n');
}

export function replaceActivity(readme, content) {
  if (readme.split(START).length !== 2 || readme.split(END).length !== 2) throw new Error('Expected exactly one activity marker pair');
  const start = readme.indexOf(START) + START.length;
  const end = readme.indexOf(END);
  if (start > end) throw new Error('Activity markers are out of order');
  const newline = readme.includes('\r\n') ? '\r\n' : '\n';
  return readme.slice(0, start) + newline + content.replace(/\r?\n/g, newline) + newline + readme.slice(end);
}

async function main() {
  const username = process.env.GH_USERNAME || 'ydflow';
  const target = 'README.md';
  const original = readFileSync(target, 'utf8');
  // Validate markers before making any API requests.
  replaceActivity(original, '');
  const search = createSearch();
  const repositories = await recentRepositories(search, username);
  console.log(`Fetching lifetime contributions for ${repositories.join(', ')}`);
  const rows = await repositoryTotals(search, username, repositories);
  const updated = replaceActivity(original, renderTable(rows, username));
  if (updated !== original) writeFileSync(target, updated, 'utf8');
  console.log(JSON.stringify(rows, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => {
    console.error(`Repository activity update failed: ${error.message}`);
    process.exitCode = 1;
  });
}
