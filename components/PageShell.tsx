import React from "react";
import DemoBar from "./DemoBar";

export default function PageShell({
  children,
  withBottomPadding = true,
}: {
  children: React.ReactNode;
  withBottomPadding?: boolean;
}) {
  return (
    <div className="min-h-screen bg-[#f5faf8]">
      <div
        className={`mx-auto w-full max-w-4xl px-5 sm:px-8 pt-[calc(env(safe-area-inset-top,0px)+1.25rem)] ${
          withBottomPadding
            ? "pb-[calc(env(safe-area-inset-bottom,0px)+5.5rem)]"
            : "pb-[calc(env(safe-area-inset-bottom,0px)+2rem)]"
        }`}
      >
        <DemoBar />
        <main id="main-content">{children}</main>
      </div>
    </div>
  );
}
