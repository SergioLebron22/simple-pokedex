export default function Pokeball({ size = 44, className = '' }) {
  return (
    <div
      className={`relative rounded-full border-[3px] border-gray-800 shadow-lg flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(to bottom, #e63946 50%, #fff 50%)',
      }}
    >
      {/* Horizontal band */}
      <div className="absolute top-1/2 left-0 right-0 h-[3px] bg-gray-800 -translate-y-1/2" />
      {/* Center button */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full border-[3px] border-gray-800"
        style={{ width: size * 0.28, height: size * 0.28 }}
      />
    </div>
  );
}
