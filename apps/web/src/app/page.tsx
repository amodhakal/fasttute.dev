/** Use http://youtube.com/watch?v=0-S5a0eXPoc for testing  */

"use client";

import LoadingPage from "@/components/LoadingPage";
import { Suspense } from "react";
import LandingPage from "./components/LandingPage";
import Features from "./components/Features";
import Footer from "./components/Footer";

export default function page() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <div className="flex flex-col gap-2 xl:gap-8">
        <LandingPage />
        <Features />
        <Footer />
      </div>
    </Suspense>
  );
}
