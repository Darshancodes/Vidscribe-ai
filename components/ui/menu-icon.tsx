import React from 'react';
import { cn } from "@/functions";

interface Props {
    isOpen: boolean;
    onClick: () => void;
}

const MenuIcon = ({ isOpen, onClick }: Props) => {
    return (
        <button
            onClick={onClick}
            className={cn("relative z-40 w-8 h-8 p-2 flex flex-col justify-center gap-1.5 hover:bg-muted rounded-md items-center lg:hidden", "focus:outline-none")}
        >
            <span
                className={cn(
                    "block w-4 h-[1.5px] bg-current rounded-full origin-center transform transition-transform duration-300 ease-in-out",
                    isOpen ? "rotate-45" : "rotate-0"
                )}
            ></span>
            <span
                className={cn(
                    "block w-4 h-[1.5px] bg-current rounded-full origin-center transform transition-transform duration-300 ease-in-out",
                    isOpen ? "-rotate-45" : "rotate-0"
                )}
            ></span>
        </button>
    );
};

export default MenuIcon;