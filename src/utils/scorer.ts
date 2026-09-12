import type {
  GitHubUser,
  GitHubRepo,
  GitHubEvent,
  GitHubOrg,
  ScoreResult,
  ScoreItem,
} from '../types/github';

export const PASS_THRESHOLD = 45;
export const MAX_TOTAL = 123;

interface ScoreInput {
  user: GitHubUser;
  repos: GitHubRepo[];
  events: GitHubEvent[];
  orgs: GitHubOrg[];
}

/**
 * 计算账号注册时长（月数）
 */
function getMonthsSince(dateString: string): number {
  const created = new Date(dateString);
  const now = new Date();
  return (
    (now.getFullYear() - created.getFullYear()) * 12 +
    (now.getMonth() - created.getMonth())
  );
}

/**
 * 判断头像是否为自定义头像（非默认 identicon）
 */
function hasCustomAvatar(user: GitHubUser): boolean {
  const avatar = user.avatar_url || '';
  // 默认头像通常包含 identicon 或 gravatar 默认参数
  if (avatar.includes('identicon')) return false;
  if (user.gravatar_id && user.gravatar_id.length > 0) return true;
  // GitHub 自动生成的头像 URL 格式：https://avatars.githubusercontent.com/u/xxx?v=4
  // 如果用户没有设置头像，GitHub 会返回 identicon
  // 通过检查 avatar_url 是否包含 ? 后面的默认参数判断
  return true; // 有 avatar_url 且不是 identicon 就算自定义
}

/**
 * 检查是否有跨多个月份的 commit 记录
 */
function hasCrossTimeCommits(events: GitHubEvent[]): {
  passed: boolean;
  months: Set<string>;
} {
  const months = new Set<string>();
  for (const event of events) {
    if (event.type === 'PushEvent' && event.payload.commits) {
      const date = new Date(event.created_at);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      months.add(monthKey);
    }
  }
  return { passed: months.size >= 2, months };
}

/**
 * 检查是否有在非自有仓库的 PR/Issue 参与
 */
function hasExternalContributions(
  events: GitHubEvent[],
  username: string
): { passed: boolean; count: number } {
  let count = 0;
  for (const event of events) {
    if (
      event.type === 'PullRequestEvent' ||
      event.type === 'IssuesEvent' ||
      event.type === 'IssueCommentEvent' ||
      event.type === 'PullRequestReviewEvent' ||
      event.type === 'PullRequestReviewCommentEvent'
    ) {
      const repoOwner = event.repo.name.split('/')[0];
      if (repoOwner.toLowerCase() !== username.toLowerCase()) {
        count++;
      }
    }
  }
  return { passed: count > 0, count };
}

/**
 * 计算资料完善度得分
 */
function calculateProfileScore(user: GitHubUser): {
  score: number;
  details: { name: string; passed: boolean; reason: string }[];
} {
  const details: { name: string; passed: boolean; reason: string }[] = [];
  let score = 0;

  // 头像（5分）
  const hasAvatar = hasCustomAvatar(user);
  if (hasAvatar) {
    score += 5;
    details.push({ name: '自定义头像', passed: true, reason: '已设置自定义头像' });
  } else {
    details.push({ name: '自定义头像', passed: false, reason: '使用默认头像' });
  }

  // 姓名（3分）
  if (user.name && user.name.trim().length > 0) {
    score += 3;
    details.push({ name: '姓名', passed: true, reason: `已填写: ${user.name}` });
  } else {
    details.push({ name: '姓名', passed: false, reason: '未填写姓名' });
  }

  // 简介（3分）
  if (user.bio && user.bio.trim().length > 0) {
    score += 3;
    details.push({ name: '个人简介', passed: true, reason: '已填写个人简介' });
  } else {
    details.push({ name: '个人简介', passed: false, reason: '未填写个人简介' });
  }

  // 邮箱（2分）
  if (user.email && user.email.trim().length > 0) {
    score += 2;
    details.push({ name: '邮箱', passed: true, reason: `已填写: ${user.email}` });
  } else {
    details.push({ name: '邮箱', passed: false, reason: '未填写公开邮箱' });
  }

  // 位置（2分）
  if (user.location && user.location.trim().length > 0) {
    score += 2;
    details.push({ name: '位置', passed: true, reason: `已填写: ${user.location}` });
  } else {
    details.push({ name: '位置', passed: false, reason: '未填写位置信息' });
  }

  return { score, details };
}

/**
 * 主评分函数
 */
export function calculateScore(input: ScoreInput): ScoreResult {
  const { user, repos, events, orgs } = input;
  const items: ScoreItem[] = [];

  // 1. 账号注册满 6 个月（25分）
  const months = getMonthsSince(user.created_at);
  const sixMonthsPassed = months >= 6;
  items.push({
    name: '账号注册满 6 个月',
    maxScore: 25,
    score: sixMonthsPassed ? 25 : 0,
    passed: sixMonthsPassed,
    reason: sixMonthsPassed
      ? `账号创建于 ${new Date(user.created_at).toLocaleDateString('zh-CN')}，已注册 ${months} 个月`
      : `账号创建于 ${new Date(user.created_at).toLocaleDateString('zh-CN')}，仅 ${months} 个月（不足 6 个月）`,
    icon: 'calendar',
  });

  // 2. 跨时间 commit 记录（20分）
  const commitCheck = hasCrossTimeCommits(events);
  items.push({
    name: '跨时间 commit 记录',
    maxScore: 20,
    score: commitCheck.passed ? 20 : 0,
    passed: commitCheck.passed,
    reason: commitCheck.passed
      ? `在 ${commitCheck.months.size} 个不同月份有 commit 记录`
      : `仅在 ${commitCheck.months.size} 个月份有 commit 记录（需至少 2 个月份）`,
    icon: 'git-commit',
  });

  // 3. 非自有仓库的 PR/Issue 参与（20分）
  const extCheck = hasExternalContributions(events, user.login);
  items.push({
    name: '非自有仓库 PR/Issue 参与',
    maxScore: 20,
    score: extCheck.passed ? 20 : 0,
    passed: extCheck.passed,
    reason: extCheck.passed
      ? `在 ${extCheck.count} 个外部仓库有 PR/Issue 参与`
      : '未在非自有仓库创建 PR 或 Issue',
    icon: 'git-pull-request',
  });

  // 4. 所属 Organization（15分）
  const hasOrg = orgs.length > 0;
  items.push({
    name: '所属 Organization',
    maxScore: 15,
    score: hasOrg ? 15 : 0,
    passed: hasOrg,
    reason: hasOrg
      ? `属于 ${orgs.length} 个组织: ${orgs.map((o) => o.login).join(', ')}`
      : '不属于任何 Organization',
    icon: 'building',
  });

  // 5. 账号满 1 年（10分）
  const oneYearPassed = months >= 12;
  items.push({
    name: '账号满 1 年',
    maxScore: 10,
    score: oneYearPassed ? 10 : 0,
    passed: oneYearPassed,
    reason: oneYearPassed
      ? `账号已注册 ${Math.floor(months / 12)} 年 ${months % 12} 个月`
      : `账号注册 ${months} 个月（不足 1 年）`,
    icon: 'clock',
  });

  // 6. 公开仓库（8分）
  const hasRepos = user.public_repos > 0;
  items.push({
    name: '公开仓库',
    maxScore: 8,
    score: hasRepos ? 8 : 0,
    passed: hasRepos,
    reason: hasRepos ? `有 ${user.public_repos} 个公开仓库` : '没有公开仓库',
    icon: 'folder',
  });

  // 7. Star（6分）
  const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
  const hasStars = totalStars > 0;
  items.push({
    name: '获得 Star',
    maxScore: 6,
    score: hasStars ? 6 : 0,
    passed: hasStars,
    reason: hasStars ? `共获得 ${totalStars} 个 Star` : '尚未获得任何 Star',
    icon: 'star',
  });

  // 8. followers（4分）— 至少 2 个关注者才算有效（1 个极可能是自刷小号）
  const hasFollowers = user.followers >= 2;
  items.push({
    name: '关注者',
    maxScore: 4,
    score: hasFollowers ? 4 : 0,
    passed: hasFollowers,
    reason: hasFollowers
      ? `有 ${user.followers} 个关注者`
      : `${user.followers} 个关注者（需至少 2 个）`,
    icon: 'users',
  });

  // 9. 头像及资料完善（15分）
  const profileCheck = calculateProfileScore(user);
  items.push({
    name: '头像及资料完善',
    maxScore: 15,
    score: profileCheck.score,
    passed: profileCheck.score >= 8, // 超过一半算通过
    reason: `资料完善度 ${profileCheck.score}/15 分（${profileCheck.details.filter((d) => d.passed).length}/5 项已填写）`,
    icon: 'user',
  });

  const total = items.reduce((sum, item) => sum + item.score, 0);

  return {
    total,
    maxTotal: MAX_TOTAL,
    passed: total >= PASS_THRESHOLD,
    items,
    username: user.login,
    calculatedAt: new Date().toISOString(),
  };
}
