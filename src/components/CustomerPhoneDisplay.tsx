type CustomerPhoneDisplayProps = {
  phone?: string | null;
  alternatePhone?: string | null;
  /** Stack vertically with smaller text (order tables) */
  compact?: boolean;
  linkify?: boolean;
};

function PhoneLine({
  number,
  label,
  linkify,
}: {
  number: string;
  label?: string;
  linkify: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {label && <span className="text-xs text-gray-500 shrink-0">{label}:</span>}
      {linkify ? (
        <a href={`tel:${number}`} className="text-blue-600 hover:underline">
          {number}
        </a>
      ) : (
        <span>{number}</span>
      )}
    </div>
  );
}

export default function CustomerPhoneDisplay({
  phone,
  alternatePhone,
  compact = false,
  linkify = true,
}: CustomerPhoneDisplayProps) {
  if (!phone && !alternatePhone) {
    return <span className="text-gray-400 text-sm">—</span>;
  }

  const textClass = compact ? "text-sm text-gray-500 space-y-0.5" : "text-sm text-gray-700 space-y-1";

  return (
    <div className={textClass}>
      {phone && (
        <PhoneLine
          number={phone}
          label={alternatePhone ? "Primary" : undefined}
          linkify={linkify}
        />
      )}
      {alternatePhone && (
        <PhoneLine number={alternatePhone} label="Alternate" linkify={linkify} />
      )}
    </div>
  );
}
