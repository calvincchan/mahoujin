"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCameraStream } from "@/components/CameraModule";
import { RingOverlay } from "@/components/RingOverlay";

export default function CaptureScreen() {
  const router = useRouter();
  const { videoRef, ready, error, capture } = useCameraStream();

  function handleScan() {
    const image = capture();
    if (!image) return;
    sessionStorage.setItem("mahoujin_capture", image);
    router.push("/analysis");
  }

  return (
    <main className="fixed inset-0 bg-black overflow-hidden">
      {/* Live camera feed */}
      <video
        ref={videoRef}
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Top nav */}
      <nav className="absolute top-0 left-0 right-0 flex justify-end px-4 py-3 z-20">
        <Link href="/shelf" aria-label="Crystal shelf" className="text-amber-400/70 text-2xl leading-none">
          ◈
        </Link>
      </nav>

      {/* Ring overlay — always visible */}
      <RingOverlay />

      {/* Status */}
      {!ready && !error && (
        <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-amber-400 text-sm font-mono animate-pulse z-10 pointer-events-none">
          Initialising camera…
        </p>
      )}
      {error && (
        <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-400 text-sm font-mono text-center px-8 z-10">
          {error}
        </p>
      )}

      {/* Scan button */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20">
        <button
          onClick={handleScan}
          disabled={!ready}
          aria-label="Scan Mahoujin"
          className="w-20 h-20 rounded-full border-2 border-amber-400 bg-amber-400/10 text-amber-400 text-xs font-mono tracking-widest uppercase flex items-center justify-center animate-pulse disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
        >
          Scan
        </button>
      </div>
    </main>
  );
}
