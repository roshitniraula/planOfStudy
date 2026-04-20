interface Props {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}

export default function StatCard({ label, value, sub, accent }: Props) {
  return (
    <div className={`rounded-lg border p-5 shadow-sm ${accent ? "bg-mnsu-purple text-white border-mnsu-purple" : "bg-white border-gray-200"}`}>
      <div className={`text-3xl font-bold ${accent ? "text-mnsu-gold" : "text-mnsu-purple"}`}>{value}</div>
      <div className={`text-sm font-medium mt-1 ${accent ? "text-white/80" : "text-gray-700"}`}>{label}</div>
      {sub && <div className={`text-xs mt-0.5 ${accent ? "text-white/60" : "text-gray-400"}`}>{sub}</div>}
    </div>
  );
}
