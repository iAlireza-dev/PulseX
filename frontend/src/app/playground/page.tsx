"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSearchParams } from "next/navigation";

const ROOMS = ["analytics", "monitoring", "alerts"];

interface WelcomeData {
  user?: { username: string };
  connectedAt: string;
}

interface PongData {
  ts: string;
}

interface RoomJoinedData {
  room: string;
}

interface RoomMessageData {
  room: string;
  user?: { username: string };
  text: string;
}

interface RateLimitedData {
  scope?: string;
  retryAfter?: number;
}

export default function PlaygroundPage() {
  const searchParams = useSearchParams();
  const backendPort = searchParams.get("backend") ?? "3001";
  const backendUrl = `http://localhost:${backendPort}`;

  const [status, setStatus] = useState("Connecting...");
  const [logs, setLogs] = useState<string[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  function addLog(line: string) {
    setLogs((prev) => {
      const next = [...prev, `${new Date().toLocaleTimeString()} — ${line}`];
      return next.slice(-120);
    });
  }

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);

    try {
      socketRef.current?.disconnect();
      socketRef.current = null;

      await fetch(`${backendUrl}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setStatus("Disconnected");
      setCurrentRoom(null);
      setMessageText("");
      setLogs([]);
      window.location.href = "/login";
    }
  }

  useEffect(() => {
    const socket = io(backendUrl, {
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setStatus("Connected");
      addLog(`Connected to server (${backendUrl})`);
    });

    socket.on("connect_error", (err) => {
      setStatus("Connection failed");
      addLog(`Connection error: ${err.message}`);
    });

    socket.on("server:welcome", (data: WelcomeData) => {
      addLog(
        `Welcome ${data.user?.username ?? "unknown"} (connected at ${data.connectedAt})`,
      );
    });

    socket.on("server:pong", (data: PongData) => {
      addLog(`PONG received at ${data.ts}`);
    });

    socket.on("server:roomJoined", (data: RoomJoinedData) => {
      setCurrentRoom(data.room);
      addLog(`Joined room "${data.room}"`);
    });

    socket.on("server:roomLeft", () => {
      addLog("Left room");
      setCurrentRoom(null);
    });

    socket.on("server:roomMessage", (data: RoomMessageData) => {
      addLog(
        `[room:${data.room}] ${data.user?.username ?? "unknown"}: ${data.text}`,
      );
    });

    socket.on("server:rateLimited", (data: RateLimitedData) => {
      const ms = Number(data?.retryAfter ?? 0);
      const sec = ms > 0 ? (ms / 1000).toFixed(1) : "0";
      addLog(`Rate limited (${data?.scope ?? "unknown"}) — retry in ${sec}s`);
    });

    socket.on("disconnect", () => {
      setStatus("Disconnected");
      addLog("Disconnected from server");
    });

    return () => {
      socket.disconnect();
    };
  }, [backendUrl]);

  function handlePing() {
    if (!socketRef.current) {
      addLog("Cannot send PING: socket not connected");
      return;
    }
    socketRef.current.emit("client:ping");
    addLog("PING sent to server");
  }

  function handleJoinRoom(room: string) {
    if (!socketRef.current) return;
    socketRef.current.emit("client:joinRoom", { room });
    addLog(`Joining room "${room}"`);
  }

  function handleLeaveRoom() {
    if (!socketRef.current) return;
    socketRef.current.emit("client:leaveRoom");
    addLog("Leaving current room");
  }

  function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!socketRef.current) return;
    const text = messageText.trim();
    if (!text || !currentRoom) return;
    socketRef.current.emit("client:roomMessage", { text });
    addLog(`[you -> ${currentRoom} @ ${backendPort}]: ${text}`);
    setMessageText("");
  }

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

        <div className="flex items-center gap-3">
          <div className="text-xs px-3 py-1 rounded-full border border-slate-700 text-slate-300">
            backend: <span className="font-mono">{backendUrl}</span>
          </div>

          <button
            onClick={handleLogout}
            className="text-xs px-3 py-1.5 rounded border border-slate-700 text-slate-200 hover:border-sky-400 hover:text-sky-300 disabled:opacity-60"
            disabled={loggingOut}
          >
            Logout
          </button>

          <span className="text-xs px-3 py-1 rounded-full border border-emerald-500 text-emerald-400">
            prototype
          </span>
        </div>
      </header>

      <main className="grid gap-4 md:grid-cols-3">
        <section className="md:col-span-1 bg-slate-950 border border-slate-800 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-slate-200 mb-2">
            Connection
          </h2>

          <p className="text-xs text-slate-400 mb-2">WebSocket status:</p>

          <p
            className={`text-sm font-semibold mb-4 ${
              status === "Connected" ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {status}
          </p>

          <button
            onClick={handlePing}
            className="text-xs px-3 py-2 rounded bg-sky-500 text-black font-semibold hover:bg-sky-400 disabled:opacity-60 mb-4"
            disabled={status !== "Connected"}
          >
            Send PING
          </button>

          <div className="border-t border-slate-800 pt-4 mt-2">
            <p className="text-xs text-slate-400 mb-2">Rooms:</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {ROOMS.map((room) => (
                <button
                  key={room}
                  onClick={() => handleJoinRoom(room)}
                  className={`text-xs px-3 py-1 rounded border ${
                    currentRoom === room
                      ? "border-sky-400 text-sky-300 bg-slate-900"
                      : "border-slate-700 text-slate-300 hover:border-sky-400"
                  }`}
                  disabled={status !== "Connected"}
                >
                  {room}
                </button>
              ))}
            </div>

            <p className="text-xs text-slate-400 mb-1">
              Current room:
              <span className="ml-1 font-semibold text-slate-200">
                {currentRoom ?? "none"}
              </span>
            </p>

            <button
              onClick={handleLeaveRoom}
              className="mt-2 text-xs px-3 py-1 rounded border border-red-500 text-red-400 hover:bg-red-500 hover:text-black disabled:opacity-60"
              disabled={!currentRoom || status !== "Connected"}
            >
              Leave room
            </button>
          </div>
        </section>

        <section className="md:col-span-2 bg-slate-950 border border-slate-800 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-slate-200 mb-2">
            Event Console
          </h2>
          <p className="text-xs text-slate-400 mb-2">
            Incoming and outgoing events will appear here in real-time.
          </p>

          <div className="h-64 bg-slate-900 border border-slate-800 rounded-md text-xs p-2 overflow-auto mb-3">
            {logs.length === 0 ? (
              <span className="text-slate-500">
                Waiting for WebSocket connection...
              </span>
            ) : (
              logs.map((line, idx) => (
                <div key={idx} className="mb-1 text-slate-200">
                  {line}
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded text-xs outline-none focus:border-sky-500"
              placeholder={
                currentRoom
                  ? `Send message to "${currentRoom}"...`
                  : "Join a room to send messages"
              }
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              disabled={!currentRoom || status !== "Connected"}
            />
            <button
              type="submit"
              className="text-xs px-3 py-2 rounded bg-sky-500 text-black font-semibold hover:bg-sky-400 disabled:opacity-60"
              disabled={!currentRoom || status !== "Connected"}
            >
              Send
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
