"use client";

import * as Popover from "@radix-ui/react-popover";
import { type ReactNode } from "react";

interface RofitUmbrellaProps {
  children?: ReactNode;
  className?: string;
}

export function RofitUmbrella({
  children = "under rofit.ro ⛱",
  className = "",
}: RofitUmbrellaProps) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={`cursor-pointer transition-colors ${className}`}
        >
          {children}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="top"
          align="center"
          sideOffset={8}
          className="z-50 rounded-lg border border-gray-200 bg-white shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <div className="w-48 h-48 overflow-hidden rounded-lg">
            <video
              src="https://rofit.ro/umbrella.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
