type KpiPairProps = {
  left: [string, string, string];
  right: [string, string, string];
};

function MetricItem({ values: [label, value, detail] }: { values: [string, string, string] }) {
  return (
    <div className="min-w-0 flex-1">
      <p className="text-xs text-[#3D2008]/75">{label}</p>
      <p className="mt-1 truncate text-[20px] font-semibold">{value}</p>
      <p className="mt-1 text-[11px] text-[#3D2008]/75">{detail}</p>
    </div>
  );
}

export default function KpiPair({ left, right }: KpiPairProps) {
  return (
    <div className="flex w-full gap-3 rounded-2xl bg-white p-4 drop-shadow-xl">
      <MetricItem values={left} />
      <div className="w-[1.5px] bg-[#3D2008]" />
      <MetricItem values={right} />
    </div>
  );
}
