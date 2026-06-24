import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PaidFeatureGate } from '@/components/student/access/PremiumLockScreen';
import { useStudentTier } from '@/hooks/useStudentTier';

export function MentorPanel({ student, sessions }) {
  const { isPremium } = useStudentTier();
  const content = (
    <div className="student-card h-full p-6">
      <h3 className="font-display text-lg font-bold">Your Mentor</h3>
      {student?.trainer_name ? (
        <div className="mt-4 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-accent-500 text-lg font-bold text-white">
            {student.trainer_name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold">{student.trainer_name}</p>
            <p className="text-sm text-slate-500">{student.trainer_email}</p>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-500">A mentor will be assigned after you upgrade and start applying.</p>
      )}
      <div className="mt-4 flex gap-2">
        <Button size="sm" asChild>
          <Link to="/student/mentors">Book Session</Link>
        </Button>
      </div>
      {(sessions || []).length > 0 && (
        <p className="mt-3 text-xs text-slate-500">{sessions.length} upcoming session(s)</p>
      )}
    </div>
  );

  return (
    <PaidFeatureGate
      isPremium={isPremium}
      feature="Mentor Access"
      title="Connect with Your Mentor"
      description="Premium students get dedicated mentor support, mock interviews, and counselling sessions."
    >
      {content}
    </PaidFeatureGate>
  );
}
