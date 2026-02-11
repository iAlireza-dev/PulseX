"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        let message = "Login failed";
        try {
          const data = await res.json();
          if (data?.error) message = data.error;
        } catch {}
        setError(message);
        return;
      }

      router.push("/playground");
    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-950 border border-slate-800 rounded-xl p-8 w-full max-w-sm shadow-lg"
      >
        <h1 className="text-2xl font-bold text-sky-400 mb-2">PulseX Login</h1>
        <p className="text-sm text-slate-400 mb-6">
          Enter your credentials to access the real-time playground.
        </p>

        <label className="block text-sm mb-1">Username</label>
        <input
          className="w-full mb-4 px-3 py-2 bg-slate-900 border border-slate-700 rounded outline-none focus:border-sky-500"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label className="block text-sm mb-1">Password</label>
        <input
          type="password"
          className="w-full mb-2 px-3 py-2 bg-slate-900 border border-slate-700 rounded outline-none focus:border-sky-500"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-xs text-red-400 mb-2">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full  bg-sky-500 hover:bg-sky-400 disabled:opacity-60 disabled:cursor-not-allowed text-black font-semibold py-2 mt-4 rounded transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="mt-4 text-xs text-slate-500 flex justify-between"></div>
      </form>
    </div>
  );
}
