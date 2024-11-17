import { cn } from "@/functions";
import React from 'react';

interface Props {
    size?: "sm" | "md" | "lg";
    className?: string;
}

const LoadingIcon = ({ size = "sm", className }: Props) => {
    return (
        <div
            className={cn(
                "border-2 border-muted-foreground border-t-foreground rounded-full animate-loading",
                size === "sm" && "w-4 h-4",
                size === "md" && "w-6 h-6",
                size === "lg" && "w-8 h-8",
                className
            )}
        />
    )
};

export default LoadingIcon