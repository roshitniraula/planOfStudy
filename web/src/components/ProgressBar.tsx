interface Props {
  stages: [boolean, boolean, boolean, boolean];
  label?: string;
}

const STAGE_LABELS = [
  "Approved",
  "Draft done",
  "Evaluated",
  "Revised",
];

export default function ProgressBar({ stages, label }: Props) {
  const completed = stages.filter(Boolean).length;
  const pct = (completed / 4) * 100;

  return (
    <div className="space-y-1">
      {label && <div className="text-xs text-gray-600 truncate max-w-xs">{label}</div>}
      <div className="flex gap-1">
        {stages.map((done, i) => (
          <div
            key={i}
            title={STAGE_LABELS[i]}
            className={`h-3 flex-1 rounded-sm ${done ? "bg-mnsu-purple" : "bg-gray-200"}`}
          />
        ))}
      </div>
      <div className="text-xs text-gray-400">{completed}/4 stages — {STAGE_LABELS.slice(0, completed).join(", ") || "None"}</div>
    </div>
  );
}
