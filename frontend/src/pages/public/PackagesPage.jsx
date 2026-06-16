import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '@/lib/api';
import { PackageCards } from '@/components/packages/PackageCards';
import { BuyNowModal } from '@/components/auth/BuyNowModal';

export default function PackagesPage() {
  const [buyPkg, setBuyPkg] = useState(null);
  const { data } = useQuery({ queryKey: ['packages'], queryFn: publicApi.packages });

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      <h1 className="font-display text-4xl font-bold">Admission Packages</h1>
      <p className="mt-2 text-slate-600">Transparent pricing. Premium outcomes.</p>
      <div className="mt-12">
        <PackageCards packages={data?.data} onBuyNow={setBuyPkg} />
      </div>
      <BuyNowModal open={!!buyPkg} onOpenChange={(o) => !o && setBuyPkg(null)} package={buyPkg} />
    </div>
  );
}
