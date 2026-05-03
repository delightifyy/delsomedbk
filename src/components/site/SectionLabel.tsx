type Props = {
  number: string;
  label: string;
  className?: string;
};

export const SectionLabel = ({ number, label, className = "" }: Props) => {
  if (!number && !label) return null;
  return (
    <div className={`flex items-center gap-3 text-xs font-medium tracking-[0.18em] text-muted-foreground ${className}`}>
      {number && <span className="font-display text-secondary">{number}</span>}
      
      {label && <span>{label}</span>}
    </div>
  );
};
