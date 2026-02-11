export default function PlaygroundPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 p-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-sky-400">PulseX Playground</h1>
          <p className="text-sm text-slate-400">
            Real-time WebSocket event hub – visualizing connections, rooms, and
            events.
          </p>
        </div>
        <span className="text-xs px-3 py-1 rounded-full border border-emerald-500 text-emerald-400">
          prototype
        </span>
      </header>

      <main className="grid gap-4 md:grid-cols-3">
        <section className="md:col-span-1 bg-slate-950 border border-slate-800 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-slate-200 mb-2">
            Connection
          </h2>
          <p className="text-xs text-slate-400">
            Here we&apos;ll show socket status, user info and current room.
          </p>
        </section>

        <section className="md:col-span-2 bg-slate-950 border border-slate-800 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-slate-200 mb-2">
            Event Console
          </h2>
          <p className="text-xs text-slate-400 mb-2">
            Incoming and outgoing events will appear here in real-time.
          </p>
          <div className="h-64 bg-slate-900 border border-slate-800 rounded-md text-xs p-2 overflow-auto">
            {/* بعداً اینجا log رو می‌آریم */}
            <span className="text-slate-500">
              Waiting for WebSocket connection...
            </span>
          </div>
        </section>
      </main>
    </div>
  );
}
