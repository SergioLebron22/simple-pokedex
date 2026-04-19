export default function ProgressBar({ filled, total, pageNumber }) {
  const pct = total ? Math.round((filled / total) * 100) : 0;

  return (
    <div className="mt-5 bg-[#0a0a18] rounded-xl px-4 py-3 border border-white/[0.07]">
      <div className="flex justify-between text-[11px] font-bold text-gray-400 mb-2">
        <span>Page {pageNumber} Progress</span>
        <span>{filled} / {total}</span>
      </div>
      <div className="h-2 bg-pokeDark rounded-full overflow-hidden">
        <div
          className="h-full rounded-full progress-gradient transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
