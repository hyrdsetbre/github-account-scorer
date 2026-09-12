import type { GitHubUser, GitHubRepo, GitHubEvent, GitHubOrg } from '../types/github';

// 通过 Cloudflare Pages Functions 代理，在服务端添加 Token
const BASE_URL = '/api/github';

const headers: HeadersInit = {
  Accept: 'application/vnd.github.v3+json',
};

export async function fetchUser(username: string): Promise<GitHubUser> {
  const response = await fetch(`${BASE_URL}/users/${encodeURIComponent(username)}`, { headers });
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`用户 "${username}" 不存在`);
    }
    throw new Error(`获取用户信息失败: ${response.status}`);
  }
  return response.json();
}

export async function fetchRepos(username: string): Promise<GitHubRepo[]> {
  const response = await fetch(
    `${BASE_URL}/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`,
    { headers }
  );
  if (!response.ok) {
    throw new Error(`获取仓库列表失败: ${response.status}`);
  }
  return response.json();
}

export async function fetchEvents(username: string): Promise<GitHubEvent[]> {
  const response = await fetch(
    `${BASE_URL}/users/${encodeURIComponent(username)}/events/public?per_page=100`,
    { headers }
  );
  if (!response.ok) {
    throw new Error(`获取活动记录失败: ${response.status}`);
  }
  return response.json();
}

export async function fetchOrgs(username: string): Promise<GitHubOrg[]> {
  const response = await fetch(
    `${BASE_URL}/users/${encodeURIComponent(username)}/orgs`,
    { headers }
  );
  if (!response.ok) {
    throw new Error(`获取组织列表失败: ${response.status}`);
  }
  return response.json();
}

export async function fetchStarredCount(username: string): Promise<number> {
  const response = await fetch(
    `${BASE_URL}/users/${encodeURIComponent(username)}/starred?per_page=100`,
    { headers }
  );
  if (!response.ok) return 0;
  const data = await response.json();
  return Array.isArray(data) ? data.length : 0;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
