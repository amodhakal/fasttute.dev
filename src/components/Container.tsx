"use client";

import { ReactNode } from "react";

export default function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="w-full">
      <div
        className={
          "px-4 max-w-[1300px] mx-auto" + (className ? " " + className : "")
        }
      >
        {children}
      </div>
    </div>
  );
}
