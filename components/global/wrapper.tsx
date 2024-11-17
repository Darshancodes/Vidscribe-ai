import React from "react";
import { cn } from "@/functions";

interface Props {
    className?: string;
    children: React.ReactNode;
}

const Wrapper = ({ children, className }: Props) => {
    return (
        <div
            className={cn(
                "size-full mx-auto max-w-6xl px-4 md:px-12",
                className
            )}
        >
            {children}
        </div>
    )
};

export default Wrapper