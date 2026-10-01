import { BrandLogo } from '@/components/BrandLogo';
import { businessConfig } from '@/lib/businessConfig';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      <div className="gradient-hero flex flex-col items-center px-4 py-8 text-center text-white">
        <BrandLogo light size="lg" />
        <p className="mt-3 max-w-xl text-sm text-white/75">{businessConfig.tagline}</p>
      </div>
      <div className="flex flex-1 items-start justify-center px-4 py-10">{children}</div>
    </div>
  );
}
