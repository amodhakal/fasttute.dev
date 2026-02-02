"use client";

import { SignedIn, UserButton } from "@clerk/clerk-react";
import { useRouter } from "next/navigation";
import { MdFeedback } from "react-icons/md";
import Container from "./Container";

export default function Header() {
  const router = useRouter();
  return (
    <SignedIn>
      <header className="w-full bg-gray-800 shadow">
        <Container className="py-4 flex flex-row-reverse">
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Action
                label="Submit feedback"
                labelIcon={<MdFeedback />}
                onClick={() => router.push("/feedback")}
              />
            </UserButton.MenuItems>
          </UserButton>
        </Container>
      </header>
    </SignedIn>
  );
}
