export default function LoadingScreen({
  message = "Loading...",
}: {
  message?: string;
}) {
  return (
    <div className="min-h-screen relative text-white flex items-center justify-center">
      {/* Background */}
      <div className="fixed inset-0 z-0 bg-[#080d14]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 20% 60%, #1d4ed840 0%, transparent 55%), radial-gradient(ellipse at 80% 40%, #0ea5e930 0%, transparent 55%)",
          }}
        />
      </div>

      {/* Loading content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Animated spinner */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
          <div
            className="absolute inset-0 w-20 h-20 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin animation-delay-150"
            style={{ animationDirection: "reverse", animationDuration: "1s" }}
          />
        </div>

        {/* Loading text */}
        <div className="text-center">
          <h2 className="text-xl font-bold text-white animate-pulse">
            {message}
          </h2>
        </div>

        {/* Loading dots animation */}
        <div className="flex gap-2">
          <div
            className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}
