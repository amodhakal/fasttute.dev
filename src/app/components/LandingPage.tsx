"use client";

import Container from "@/components/Container";
import { pollerOne } from "@/fonts";
import { api } from "@/server/_generated/api";
import { errorToast } from "@/utils/errorToast";
import { useAuth } from "@clerk/clerk-react";
import { useAction } from "convex/react";
import { redirect, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

export default function LandingPage() {
  const { userId } = useAuth();
  const searchParams = useSearchParams();

  const [value, setValue] = useState(searchParams.get("value") || "");
  const [isLoading, setIsLoading] = useState(false);
  const retrieveVideoInfo = useAction(api.retrieveVideoInfo.retrieveVideoInfo);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const landingRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleMouseMove(event: MouseEvent) {
      if (!mainRef.current) return;
      const rect = mainRef.current.getBoundingClientRect();
      if (
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      ) {
        setMousePosition({ x: event.clientX, y: event.clientY });
      }
    }
    const node = mainRef.current;
    if (node) {
      node.addEventListener("mousemove", handleMouseMove);
    }
    return () => {
      if (node) {
        node.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

  return (
    <main
      ref={mainRef}
      className="bg-[#0a0a0a] min-h-[95vh] w-full flex items-center text-neutral-200 relative overflow-hidden"
    >
      <Container>
        <div
          ref={landingRef}
          className="w-full max-w-3xl mx-auto flex flex-col items-center text-center relative z-10 gap-y-12"
        >
          <div className="flex flex-col items-center gap-y-6">
            <h1
              className={
                "text-4xl sm:text-5xl md:text-7xl font-bold tracking-tighter leading-tight text-white [text-shadow:0_0_5px_theme(colors.white/0.8),_0_0_15px_theme(colors.red.400/0.4)] " +
                pollerOne.className
              }
            >
              Stop scrubbing.
              <br />
              Start building.
            </h1>

            <p className="max-w-xl text-lg md:text-xl leading-relaxed bg-gradient-to-r from-neutral-300 to-neutral-500 bg-clip-text text-transparent">
              Transform any video into an interactive lesson that finds answers,
              explains concepts, and helps you learn faster.
            </p>
          </div>

          <form onSubmit={handleValueSubmit} className="w-full max-w-xl">
            <div className="group relative w-full rounded-xl bg-gradient-to-r from-red-600/50 via-red-600 to-red-600/50 p-[2px] transition-all duration-300 shadow-[0_0_30px_theme(colors.red.600/0.4)] group-hover:shadow-[0_0_50px_theme(colors.red.600/0.6)]">
              <div className="relative flex w-full items-center justify-between rounded-[10px] bg-[#0a0a0a] px-2 py-1">
                <input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  type="text"
                  name="video"
                  placeholder="Paste a YouTube video URL or ID..."
                  className="w-full h-14 pl-4 pr-2 bg-transparent text-lg text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:ring-0 [color-scheme:dark] [box-shadow:0_0_0_1000px_#0a0a0a_inset!important] autofill:text-neutral-200"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-lg bg-red-600 transition-all duration-300 hover:bg-red-500 hover:cursor-pointer active:scale-95 disabled:bg-neutral-800 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
        <div
          className="pointer-events-none fixed inset-0 z-0 transition duration-300"
          style={{
            background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(220, 38, 38, 0.2), transparent 80%)`,
          }}
        ></div>

        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48' width='48' height='48' fill='none' stroke='rgb(239 68 68 / 0.1)'%3e%3cpath d='M0 .5H47.5V48'/%3e%3c/svg%3e")`,
          }}
        ></div>

        <div className="absolute left-1/2 -translate-x-1/2 bottom-4 z-20 flex flex-col items-center">
          <svg
            className="animate-bounce w-7 h-7 text-neutral-400 opacity-70"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </Container>
    </main>
  );

  async function handleValueSubmit(ev: FormEvent) {
    ev.preventDefault();
    setIsLoading(true);
    const { error, youtubeId } = await retrieveVideoInfo({
      youtubeUrlOrId: value,
      ownerId: userId ?? undefined,
    });
    setIsLoading(false);

    if (error) {
      errorToast(error, "Invalid id");
      setValue("");
      return;
    }

    redirect(`/video/${youtubeId}`);
  }
}
