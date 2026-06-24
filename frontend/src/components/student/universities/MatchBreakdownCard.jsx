import { Progress } from '@/components/ui/progress';
import { MatchScoreBadge } from '@/components/student/shared/MatchScoreBadge';

export function MatchBreakdownCard({ match, title = 'Why this university matches you' }) {
  if (!match) return null;

  return (
    <div className="student-card p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Student Decision Center</p>
          <h2 className="font-display text-xl font-bold">{title}</h2>
          <p className="mt-1 text-sm text-slate-600">{match.label}</p>
        </div>
        <MatchScoreBadge score={match.score} className="text-sm" />
      </div>

      <div className="mt-6 space-y-4">
        {match.factors?.map((f) => (
          <div key={f.key}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium">{f.label}</span>
              <span className="text-slate-500">
                {f.score}/{f.max}
              </span>
            </div>
            <Progress value={(f.score / f.max) * 100} className="h-2" />
            <p className="mt-1 text-xs text-slate-500">{f.detail}</p>
          </div>
        ))}
      </div>

      {match.recommendations?.length > 0 && (
        <div className="mt-6 rounded-xl bg-brand-50 p-4">
          <p className="text-xs font-semibold uppercase text-brand-700">Recommendations</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {match.recommendations.map((r) => (
              <li key={r}>• {r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
