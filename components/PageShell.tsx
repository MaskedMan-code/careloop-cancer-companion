import React from "react";

export default function PageShell({
  children,
  withBottomPadding = true,
}: {
  children: React.ReactNode;
  withBottomPadding?: boolean;
}) {
  return (
    <div className="min-h-screen bg-white">
      <div
        className={`mx-auto w-full max-w-md px-5 pt-[calc(env(safe-area-inset-top,0px)+1.25rem)] ${
          withBottomPadding
            ? "pb-[calc(env(safe-area-inset-bottom,0px)+5.5rem)]"
            : "pb-[calc(env(safe-area-inset-bottom,0px)+2rem)]"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
