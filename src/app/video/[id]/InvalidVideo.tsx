"use client";

import { useRouter } from "next/navigation";

export default function InvalidVideo({ id }: { id: string }) {
  const router = useRouter();

  return (
    <div className="w-screen min-h-screen flex justify-center items-center">
      <div className="flex flex-col gap-4 items-center p-8 shadow rounded-xl bg-gray-50">
        <h1 className="font-bold text-2xl">This video doesn&apos;t exist</h1>
        <button
          onClick={() => router.push(`/?value=${id}`, {})}
          className="rounded-xl text-white px-4 py-2 w-md bg-green-600 hover:cursor-pointer hover:bg-green-500 active:bg-green-700"
        >
          Get this video
        </button>
      </div>
    </div>
  );
}
