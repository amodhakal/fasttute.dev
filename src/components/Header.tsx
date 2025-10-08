import { SignedIn, UserButton } from "@clerk/clerk-react";

export default function Header() {
  return (
    <SignedIn>
      <header className="p-4 w-full flex flex-row-reverse bg-gray-800 shadow">
        <UserButton />
      </header>
    </SignedIn>
  );
}
