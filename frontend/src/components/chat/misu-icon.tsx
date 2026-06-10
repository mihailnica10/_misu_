"use client";

import React from "react";

type MisuIconProps = {
    size?: number;
    spin?: boolean;
    className?: string;
    style?: React.CSSProperties;
    /** @deprecated No longer used */
    done?: boolean;
    /** @deprecated No longer used */
    error?: boolean;
    /** @deprecated No longer used */
    mike?: boolean;
    /** @deprecated No longer used */
    romania?: boolean;
};

export function MisuIcon({
    size = 24,
    spin = false,
    className,
    style,
}: MisuIconProps) {
    return (
        <span
            className={`shrink-0 inline-block ${className ?? ""}`}
            style={{
                animation: spin ? "spin 1.5s linear infinite" : undefined,
                ...style,
            }}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 100 100"
                width={size}
                height={size}
                style={{ display: "block" }}
            >
                <path
                    d="M 18 85 L 18 20 L 50 55 L 82 20 L 82 85"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={12}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </span>
    );
}
