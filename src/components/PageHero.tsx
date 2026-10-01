export function PageHero({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="gradient-hero border-b border-navy/20 py-12 text-white md:py-16">
      <div className="container-page">
        <h1 className="font-serif text-3xl text-white md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-white/80">{subtitle}</p>}
      </div>
    </div>
  );
}
