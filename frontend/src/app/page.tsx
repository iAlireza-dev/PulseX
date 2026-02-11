import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-sky-400">PulseX</h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          A real-time WebSocket event hub. Login to authenticate and explore
          live events, rooms, and rate-limited messaging.
        </p>
        <div className="flex gap-3 justify-center text-sm">
          <Link
            href="/login"
            className="px-4 py-2 rounded bg-sky-500 text-black font-semibold hover:bg-sky-400"
          >
            Go to Login
          </Link>
          <Link
            href="/playground"
            className="px-4 py-2 rounded border border-slate-600 text-slate-200 hover:border-sky-500"
          >
            Open Playground
          </Link>
        </div>
      </div>
    </div>
  );
}