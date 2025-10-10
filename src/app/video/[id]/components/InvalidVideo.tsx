"use client";

import { useRouter } from "next/navigation";

export default function InvalidVideo({
  youtubeId,
}: {
  youtubeId: string | undefined;
}) {
  const router = useRouter();

  return (
    <div className="w-screen min-h-screen flex justify-center items-center text-white">
      <div className="flex flex-col gap-6 items-center p-6 sm:p-8 shadow-2xl rounded-2xl bg-gray-900 border border-gray-700 w-11/12 max-w-md">
        <h1 className="font-extrabold text-2xl sm:text-3xl text-red-500 text-center">
          Video Not Found
        </h1>
        <p className="text-gray-400 text-center text-sm sm:text-base">
          The video you are looking for does not exist or has been removed.
        </p>
        <button
          onClick={() => router.push(`/?value=${youtubeId}`, {})}
          className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-full bg-red-600 transition-all duration-300 hover:bg-red-500 hover:cursor-pointer active:scale-95 disabled:bg-neutral-800 disabled:cursor-not-allowed shadow-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 sm:h-6 sm:w-6 text-white"
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
        </button>
      </div>
    </div>
  );
}
