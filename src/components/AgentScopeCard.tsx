import { ExternalLink, CheckCircle2, AlertCircle, Rocket, Gift, Link2, Award } from 'lucide-react';

const AGENTSCOPE_URL = 'https://platform.agentscope.io';

interface AgentScopeCardProps {
  variant: 'info' | 'result';
  passed?: boolean;
  score?: number;
}

function Disclaimer() {
  return (
    <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
      <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
        本项目全部由 AI 自动部署，评分结果仅供参考测试，不构成任何官方认证或担保
      </p>
    </div>
  );
}

export default function AgentScopeCard({ variant, passed, score }: AgentScopeCardProps) {
  // info 模式：首页介绍
  if (variant === 'info') {
    return (
      <div className="mt-10 max-w-2xl mx-auto p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-2xl border border-indigo-200/60 dark:border-indigo-800/40 text-left">
        <div className="flex items-center gap-2 mb-3">
          <Rocket className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            AgentScope Platform
          </h3>
          <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 rounded-full">
            免费部署
          </span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
          一个免费的 AI 应用部署平台，支持一键部署 QwenPaw 等 AI 应用，无需担心服务器成本。
        </p>
        <ul className="space-y-2 mb-5">
          <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Gift className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
            <span>免费部署 QwenPaw，零成本体验 AI 应用</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Link2 className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
            <span>绑定 GitHub 账号即可使用</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Award className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
            <span>账号评分合格（≥ 45 分）即可开通</span>
          </li>
        </ul>
        <a
          href={AGENTSCOPE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          立即前往体验
          <ExternalLink className="w-4 h-4" />
        </a>
        <Disclaimer />
      </div>
    );
  }

  // result 模式：根据是否合格显示不同样式
  if (passed) {
    return (
      <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-2xl border border-green-200/60 dark:border-green-800/40">
        <div className="flex items-center gap-3 mb-3">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              恭喜！您的账号已达标
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              当前得分 <strong className="text-green-600 dark:text-green-400">{score} 分</strong>，满足 AgentScope Platform 开通条件
            </p>
          </div>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
          开启您的 AI 之旅！前往 AgentScope Platform 免费部署 QwenPaw，体验一站式 AI 应用部署。
        </p>
        <a
          href={AGENTSCOPE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          前往 AgentScope Platform 部署
          <ExternalLink className="w-4 h-4" />
        </a>
        <Disclaimer />
      </div>
    );
  }

  // result 不合格模式
  return (
    <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
      <div className="flex items-center gap-3 mb-3">
        <AlertCircle className="w-8 h-8 text-slate-400" />
        <div>
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">
            还差一点点，继续加油！
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            当前得分 <strong>{score} 分</strong>，距及格线 45 分还差 {45 - (score ?? 0)} 分
          </p>
        </div>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        提升 GitHub 账号活跃度后，即可在 AgentScope Platform 免费部署 QwenPaw。
        建议：增加跨时间 commit、参与开源项目贡献、完善账号资料。
      </p>
      <a
        href={AGENTSCOPE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
      >
        先了解 AgentScope Platform
        <ExternalLink className="w-4 h-4" />
      </a>
      <Disclaimer />
    </div>
  );
}
