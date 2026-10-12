import { test } from 'node:test';
import assert from 'node:assert/strict';
import { queries, recentRepositories, repositoryTotals, renderTable, replaceActivity } from './update-repository-activity.mjs';

const pr = (repository, created, merged = null, updated = created) => ({
  repository_url: `https://api.github.com/repos/${repository}`,
  created_at: created, updated_at: updated, pull_request: { merged_at: merged },
});
const result = items => ({ items, total_count: items.length, incomplete_results: false });

test('selects distinct repositories by actual contribution, ignoring unrelated PR updates and profile maintenance', async () => {
  const search = async (endpoint, query) => {
    if (endpoint === 'commits') return result([
      { repository: { full_name: 'ydflow/ydflow' }, commit: { author: { date: '2026-10-13T10:00:00+08:00' } } },
      { repository: { full_name: 'owner/a' }, commit: { author: { date: '2026-10-12T10:00:00+08:00' } } },
    ]);
    if (query.includes('is:merged')) return result([
      pr('owner/stale', '2020-01-01', '2020-01-02', '2026-10-13'),
      pr('owner/a', '2026-09-01', '2026-10-11', '2026-10-11'),
    ]);
    return result([pr('owner/b', '2026-10-12T01:00:00Z'), pr('owner/a', '2026-10-01')]);
  };
  assert.deepEqual(await recentRepositories(search, 'ydflow', 2), ['owner/a', 'owner/b']);
});

test('continues pagination when recent commits fill a page from a single repository', async () => {
  const pages = [];
  const search = async (endpoint, query, sort, page) => {
    if (endpoint !== 'commits') return result([]);
    pages.push(page);
    const repository = page === 1 ? 'ydflow/a' : 'ydflow/b';
    return { items: Array.from({ length: page === 1 ? 100 : 1 }, () => ({ repository: { full_name: repository }, commit: { author: { date: page === 1 ? '2026-10-12' : '2026-10-11' } } })), total_count: 101 };
  };
  assert.deepEqual(await recentRepositories(search, 'ydflow', 2), ['ydflow/a', 'ydflow/b']);
  assert.deepEqual(pages, [1, 2]);
});

test('copied authored commits in an unrelated mirror do not imply participation', async () => {
  const search = async (endpoint, query) => {
    if (endpoint === 'commits') return result([
      { repository: { full_name: 'stranger/mirror' }, commit: { author: { date: '2026-10-13' } } },
      { repository: { full_name: 'ydflow/project' }, commit: { author: { date: '2026-10-12' } } },
    ]);
    return result(query.includes('is:merged') ? [] : [pr('upstream/project', '2026-10-11')]);
  };
  assert.deepEqual(await recentRepositories(search, 'ydflow'), ['ydflow/project', 'upstream/project']);
});

test('an older PR establishes participation for a repo with a recent direct commit', async () => {
  const search = async (endpoint, query, sort, page) => {
    if (endpoint === 'commits') return result([{ repository: { full_name: 'upstream/old-pr' }, commit: { author: { date: '2026-10-13' } } }]);
    if (query.includes('is:merged')) return result([]);
    return { total_count: 101, items: page === 1 ? [
      pr('ydflow/a', '2026-10-12'), pr('ydflow/b', '2026-10-11'),
      ...Array.from({ length: 98 }, () => pr('ydflow/a', '2020-02-01')),
    ] : [pr('upstream/old-pr', '2020-01-01')] };
  };
  assert.deepEqual(await recentRepositories(search, 'ydflow', 2), ['upstream/old-pr', 'ydflow/a']);
});

test('uses lifetime counts including more than 1000 commits and distinguishes closed from merged PRs', async () => {
  const search = async (endpoint, query) => {
    assert.equal(/created:|merged:|author-date:/.test(query), false);
    return { items: [], incomplete_results: false, total_count: endpoint === 'commits' ? 1500 : query.includes('is:merged') ? 8 : 12 };
  };
  assert.deepEqual(await repositoryTotals(search, 'ydflow', ['owner/a']), [{ repository: 'owner/a', commits: 1500, opened: 12, merged: 8 }]);
  assert.match(queries('ydflow', 'owner/a').merged, /is:pr is:merged/);
});

test('incomplete API results fail instead of replacing counts with partial data', async () => {
  await assert.rejects(repositoryTotals(async () => ({ total_count: 3, incomplete_results: true }), 'ydflow', ['owner/a']), /Incomplete/);
});

test('keeps content and CRLF outside activity markers unchanged', () => {
  const readme = 'banner\r\n<!--START_SECTION:activity-->\r\nold\r\n<!--END_SECTION:activity-->\r\nfooter';
  assert.equal(replaceActivity(readme, 'table\nrow'), 'banner\r\n<!--START_SECTION:activity-->\r\ntable\r\nrow\r\n<!--END_SECTION:activity-->\r\nfooter');
  assert.throws(() => replaceActivity('missing', 'table'), /marker pair/);
  assert.throws(() => replaceActivity('<!--END_SECTION:activity--><!--START_SECTION:activity-->', 'table'), /out of order/);
});

test('table links to auditable lifetime searches and states the default-branch commit scope', () => {
  const table = renderTable([{ repository: 'owner/a', commits: 10, opened: 4, merged: 3 }], 'ydflow');
  assert.match(table, /累计贡献/);
  assert.match(table, /默认分支/);
  assert.match(table, /\[3\].*is%3Amerged/);
  assert.equal(table.includes('30'), false);
});
