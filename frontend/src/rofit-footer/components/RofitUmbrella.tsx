"use client";

import * as Popover from "@radix-ui/react-popover";
import { type ReactNode } from "react";

const GIF_URL =
  "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ3o1bTA1MzYxZWFmaXI3azg2OTVqam4xeXU0YnFhcXcya2VmbTJpMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/HBsHdiDicKcV1IZKOW/giphy.gif";

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
          style={{
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            lineHeight: 0,
          }}
        >
          <img
            src={GIF_URL}
            alt="ROFIT"
            style={{
              display: "block",
              maxWidth: 280,
              width: "100%",
              height: "auto",
              borderRadius: 8,
            }}
          />
          <Popover.Arrow style={{ fill: "#fff" }} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
