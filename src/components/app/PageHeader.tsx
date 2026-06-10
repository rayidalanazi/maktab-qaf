interface PageHeaderProps {
  title: string;
  sub?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, sub, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
      <div className="min-w-0">
        <h2 className="font-display font-black text-2xl sm:text-3xl leading-tight">
          {title}
        </h2>
        {sub && (
          <p className="text-sm text-[var(--text-muted)] mt-1">{sub}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
