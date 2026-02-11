"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // فعلاً فقط لاگ می‌کنیم، بعداً وصلش می‌کنیم به backend
    console.log("login", { username, password });
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
          className="w-full mb-6 px-3 py-2 bg-slate-900 border border-slate-700 rounded outline-none focus:border-sky-500"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-sky-500 hover:bg-sky-400 text-black font-semibold py-2 rounded transition"
        >
          Login
        </button>

        <div className="mt-4 text-xs text-slate-500 flex justify-between">
          <span>Demo project: PulseX</span>
          <Link href="/playground" className="text-sky-400 hover:underline">
            Skip to playground →
          </Link>
        </div>
      </form>
    </div>
  );
}