/** Use http://youtube.com/watch?v=0-S5a0eXPoc for testing  */

import { Suspense } from "react";
import { Home } from "./Home";

export default async function page() {
  return (
    <Suspense>
      <Home />
    </Suspense>
  );
}
