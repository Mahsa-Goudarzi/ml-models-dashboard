export default function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[var(--bg-primary)] p-4 flex flex-col gap-3 overflow-auto">
      <div className="text-[10px] font-medium text-[var(--text-secondary)] uppercase tracking-[0.6px]">
        {title}
      </div>
      {children}
    </div>
  );
}
