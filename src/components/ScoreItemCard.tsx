import {
  Calendar,
  GitCommit,
  GitPullRequest,
  Building2,
  Clock,
  Folder,
  Star,
  Users,
  User,
  Check,
  X,
  type LucideIcon,
} from 'lucide-react';
import type { ScoreItem } from '../types/github';

const iconMap: Record<string, LucideIcon> = {
  calendar: Calendar,
  'git-commit': GitCommit,
  'git-pull-request': GitPullRequest,
  building: Building2,
  clock: Clock,
  folder: Folder,
  star: Star,
  users: Users,
  user: User,
};

interface ScoreItemCardProps {
  item: ScoreItem;
  index: number;
}

export default function ScoreItemCard({ item, index }: ScoreItemCardProps) {
  const Icon = iconMap[item.icon] || User;
  const percentage = item.maxScore > 0 ? (item.score / item.maxScore) * 100 : 0;

  return (
    <div
      className={`p-4 rounded-xl border transition-all duration-300 animate-fade-in-up ${
        item.passed
          ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20'
          : 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20'
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start gap-3">
        <div
          className={`p-2 rounded-lg flex-shrink-0 ${
            item.passed
              ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400'
              : 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400'
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="font-medium text-sm text-slate-800 dark:text-slate-200">
              {item.name}
            </h4>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className={`text-sm font-bold ${
                  item.passed
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {item.score}/{item.maxScore}
              </span>
              {item.passed ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <X className="w-4 h-4 text-red-500" />
              )}
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{item.reason}</p>
          <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                item.passed ? 'bg-green-500' : 'bg-red-400'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
