"use client";

import { SignedIn, UserButton } from "@clerk/clerk-react";
import { useRouter } from "next/navigation";
import { MdFeedback } from "react-icons/md";

export default function Header() {
  const router = useRouter();
  return (
    <SignedIn>
      <header className="p-4 w-full flex flex-row-reverse bg-gray-800 shadow">
        <UserButton>
          <UserButton.MenuItems>
            <UserButton.Action
              label="Submit feedback"
              labelIcon={<MdFeedback />}
              onClick={() => router.push("/feedback")}
            />
          </UserButton.MenuItems>
        </UserButton>
      </header>
    </SignedIn>
  );
}
