/** Use http://youtube.com/watch?v=0-S5a0eXPoc for testing  */

import LoadingPage from "@/components/LoadingPage";
import { Suspense } from "react";
import { LandingPage } from "./LandingPage";

export default async function page() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <LandingPage />
    </Suspense>
  );
}
