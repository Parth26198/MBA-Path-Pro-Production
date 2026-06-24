import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '@/lib/api';
import { PackageCards } from '@/components/packages/PackageCards';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';

export default function PackagesPage() {
  const { token } = useAuthStore();
  const { data } = useQuery({ queryKey: ['packages'], queryFn: publicApi.packages });

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      <h1 className="font-display text-4xl font-bold">Admission Packages</h1>
      <p className="mt-2 text-slate-600">Transparent pricing. Purchase inside your student dashboard after signing up.</p>
      <div className="mt-8">
        <Button variant="premium" asChild>
          <Link to={token ? '/student/packages' : '/register'}>
            {token ? 'Go to Dashboard Packages' : 'Sign Up to Get Started'}
          </Link>
        </Button>
      </div>
      <div className="mt-12">
        <PackageCards packages={data?.data} mode="marketing" />
      </div>
    </div>
  );
}
