import Container from "@/components/Container";
import Link from "next/link";

export default function Footer() {
  return (
    <Container>
      <hr className="text-gray-700" />
      <div className="flex justify-center p-4 gap-4">
        <Link
          href={"/terms"}
          className="hover:text-gray-200 active:text-gray-100"
        >
          Terms of Service
        </Link>

        <Link
          href={"https://github.com/amodhakal"}
          className="text-red-500 hover:text-red-400 active:text-red-600"
        >
          Made by Amodh
        </Link>
        <Link
          href={"/privacy"}
          className="hover:text-gray-200 active:text-gray-100"
        >
          Privacy Policy
        </Link>
      </div>
    </Container>
  );
}
