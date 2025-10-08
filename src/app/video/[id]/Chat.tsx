"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
} from "@clerk/clerk-react";

export default function Chat() {
  return (
    <div className="bg-gray-800 text-gray-100 rounded-lg p-4 flex justify-center items-center">
      <SignedOut>
        <div className="flex flex-col gap-2">
          <p className="">You must be signed in to use AI chat</p>
          <div className="flex w-full gap-4 justify-center">
            <div className="flex justify-center items-center rounded-xl text-white px-4 py-2 w-full bg-green-600 hover:cursor-pointer hover:bg-green-500 active:bg-green-700">
              <SignInButton />
            </div>
            <div className="flex justify-center items-center rounded-xl text-white px-4 py-2 w-full bg-green-600 hover:cursor-pointer hover:bg-green-500 active:bg-green-700">
              <SignUpButton />
            </div>
          </div>
        </div>
      </SignedOut>
      <SignedIn>Chat not available right now.</SignedIn>
    </div>
  );
}
