export default function Loading() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "3px",
        zIndex: 99999,
        background: "linear-gradient(90deg, #299E60, #fa6400)",
        animation: "navProgress 1.2s ease-in-out infinite",
      }}
    >
      <style>{`
        @keyframes navProgress {
          0% { width: 0%; opacity: 1; }
          70% { width: 85%; opacity: 1; }
          100% { width: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
