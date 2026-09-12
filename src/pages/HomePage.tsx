import { useState } from 'react';
import { Search, Loader2, AlertCircle, RefreshCw, ExternalLink, Calendar, GitBranch, Users } from 'lucide-react';
import { fetchUser, fetchRepos, fetchEvents, fetchOrgs, fetchStarredCount, fetchCommitDates, formatDate } from '../services/githubApi';
import { calculateScore, PASS_THRESHOLD } from '../utils/scorer';
import type { GitHubUser, ScoreResult } from '../types/github';
import ScoreRing from '../components/ScoreRing';
import ScoreItemCard from '../components/ScoreItemCard';
import AgentScopeCard from '../components/AgentScopeCard';
import { GithubIcon } from '../components/GithubIcon';

export default function HomePage() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || loading) return;

    setLoading(true);
    setError(null);
    setUser(null);
    setScoreResult(null);

    try {
      const [userData, reposData, eventsData, orgsData, starredCount, commitDates] = await Promise.all([
        fetchUser(username.trim()),
        fetchRepos(username.trim()),
        fetchEvents(username.trim()),
        fetchOrgs(username.trim()),
        fetchStarredCount(username.trim()),
        fetchCommitDates(username.trim()),
      ]);

      setUser(userData);
      const result = calculateScore({
        user: userData,
        repos: reposData,
        events: eventsData,
        orgs: orgsData,
        starredCount,
        commitDates,
      });
      setScoreResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '查询失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setUsername('');
    setUser(null);
    setScoreResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      {/* Header */}
      <header className="border-b border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl">
              <GithubIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                GitHub 账号评分
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                基于公开数据的账号质量评估
              </p>
            </div>
          </div>
          {scoreResult && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              重新查询
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Search Form */}
        {!scoreResult && (
          <div className="text-center mb-10 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl mb-6">
              <Search className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-3">
              评估你的 GitHub 账号
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
              输入 GitHub 用户名，基于注册时长、贡献记录、社区参与等维度进行综合评分
            </p>

            <form onSubmit={handleSearch} className="max-w-md mx-auto">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <GithubIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="输入 GitHub 用户名"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !username.trim()}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-medium rounded-xl transition-all flex items-center gap-2 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                  查询
                </button>
              </div>
            </form>

            {error && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 max-w-md mx-auto">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400 text-left">{error}</p>
              </div>
            )}

            {/* Score Rules Preview */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
              {[
                { label: '注册时长', score: '35分' },
                { label: '贡献记录', score: '20分' },
                { label: '社区参与', score: '20分' },
                { label: '组织归属', score: '15分' },
                { label: '仓库与Star', score: '14分' },
                { label: '资料完善', score: '19分' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-3 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60"
                >
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
                  <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{item.score}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-xs text-slate-400 dark:text-slate-500">
              及格线：{PASS_THRESHOLD} 分 | 满分：123 分
            </p>

            {/* AgentScope Platform 介绍卡片 */}
            <AgentScopeCard variant="info" />
          </div>
        )}

        {/* Results */}
        {scoreResult && user && (
          <div className="animate-fade-in-up">
            {/* User Info Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <img
                  src={user.avatar_url}
                  alt={user.login}
                  className="w-20 h-20 rounded-full border-4 border-indigo-100 dark:border-indigo-900"
                />
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                      {user.name || user.login}
                    </h2>
                    <a
                      href={user.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-indigo-500 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">@{user.login}</p>
                  {user.bio && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{user.bio}</p>
                  )}
                  <div className="flex flex-wrap gap-4 mt-3 justify-center sm:justify-start text-sm text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(user.created_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitBranch className="w-4 h-4" />
                      {user.public_repos} 仓库
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {user.followers} 关注者
                    </span>
                  </div>
                </div>
                <ScoreRing
                  score={scoreResult.total}
                  maxScore={scoreResult.maxTotal}
                  passed={scoreResult.passed}
                />
              </div>
            </div>

            {/* Score Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {scoreResult.total}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">总得分</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {scoreResult.items.filter((i) => i.passed).length}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">通过项</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
                <p className="text-2xl font-bold text-red-500 dark:text-red-400">
                  {scoreResult.items.filter((i) => !i.passed).length}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">未通过项</p>
              </div>
            </div>

            {/* Score Items */}
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">
              评分详情
            </h3>
            <div className="space-y-3">
              {scoreResult.items.map((item, index) => (
                <ScoreItemCard key={item.name} item={item} index={index} />
              ))}
            </div>

            {/* AgentScope Platform 结果卡片 */}
            <AgentScopeCard
              variant="result"
              passed={scoreResult.passed}
              score={scoreResult.total}
            />

            {/* Note */}
            <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <p className="text-xs text-amber-700 dark:text-amber-400">
                <strong>说明：</strong>评分基于 GitHub 公开 API 数据，事件记录仅包含最近 300 条公开活动。
                评分结果仅供参考，不代表账号的真实价值。
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 dark:border-slate-800/60 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-slate-400 dark:text-slate-500">
          <p>GitHub Account Scorer | 数据来源：GitHub Public API</p>
        </div>
      </footer>
    </div>
  );
}
