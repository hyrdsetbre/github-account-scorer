export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  bio: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  gravatar_id: string | null;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  created_at: string;
  updated_at: string;
  owner: {
    login: string;
  };
}

export interface GitHubEvent {
  id: string;
  type: string;
  actor: {
    login: string;
  };
  repo: {
    name: string;
  };
  created_at: string;
  payload: {
    commits?: Array<{
      sha: string;
      message: string;
    }>;
    action?: string;
    pull_request?: {
      html_url: string;
      title: string;
    };
    issue?: {
      html_url: string;
      title: string;
    };
  };
}

export interface GitHubOrg {
  login: string;
  id: number;
  avatar_url: string;
  description: string | null;
  public_repos?: number;
}

export interface ScoreItem {
  name: string;
  maxScore: number;
  score: number;
  passed: boolean;
  reason: string;
  icon: string;
}

export interface ScoreResult {
  total: number;
  maxTotal: number;
  passed: boolean;
  items: ScoreItem[];
  username: string;
  calculatedAt: string;
}
