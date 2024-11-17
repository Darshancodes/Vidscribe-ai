"use client";

import { cn } from "@/functions";
import { useClerk } from "@clerk/nextjs";
import { ArrowRightIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Icons from "../global/icons";
import Wrapper from "../global/wrapper";
import { Button } from "../ui/button";
import Menu from "./menu";
import MobileMenu from "./mobile-menu";

const Navbar = () => {
    const { user } = useClerk(); // Clerk hook to get the current user
    const [isOpen, setIsOpen] = useState<boolean>(false); // State to toggle mobile menu

    // Disable body scroll when mobile menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        // Clean up overflow styles on unmount
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    return (
        <div className="relative w-full h-full">
            <div className="z-[99] fixed pointer-events-none inset-x-0 h-[88px] bg-[rgba(10,10,10,0.8)] backdrop-blur-sm [mask:linear-gradient(to_bottom,#000_20%,transparent_calc(100%-20%))]"></div>

            <header
                className={cn(
                    "fixed top-4 inset-x-0 mx-auto max-w-6xl px-2 md:px-12 z-[100] transform th",
                    isOpen ? "h-[calc(100%-24px)]" : "h-12"
                )}
            >
                <Wrapper className="backdrop-blur-lg rounded-xl lg:rounded-2xl border border-[rgba(124,124,124,0.2)] px- md:px-2 flex items-center justify-start">
                    <div className="flex items-center justify-between w-full sticky mt-[7px] lg:mt-auto mb-auto inset-x-0">
                        <div className="flex items-center flex-1 lg:flex-none pl-1">
                            <Link href="/" className="text-lg font-semibold text-foreground">
                                <Icons.icon className="w-auto h-5" />
                            </Link>
                            <div className="items-center hidden ml-4 lg:flex">
                                <Menu />
                            </div>
                        </div>
                        <div className="items-center flex gap-2 lg:gap-4">
                            {user ? (
                                <Button size="sm" variant="white" asChild className="hidden sm:flex">
                                    <Link href="/app">
                                        Dashboard
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button size="sm" variant="tertiary" asChild className="hover:translate-y-0 hover:scale-100">
                                        <Link href="/auth/signin">
                                            Login
                                        </Link>
                                    </Button>
                                    <Button size="sm" variant="white" asChild className="hidden sm:flex">
                                        <Link href="/auth/signup">
                                            Start for free
                                            <ArrowRightIcon className="w-4 h-4 ml-2 hidden lg:block" />
                                        </Link>
                                    </Button>
                                </>
                            )}
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setIsOpen((prev) => !prev)}
                                className="lg:hidden p-2 w-8 h-8"
                            >
                                {isOpen ? <XIcon className="w-4 h-4 duration-300" /> : <Icons.menu className="w-3.5 h-3.5 duration-300" />}
                            </Button>
                        </div>
                    </div>
                    <MobileMenu isOpen={isOpen} setIsOpen={setIsOpen} />
                </Wrapper>
            </header>
        </div>
    );
};

export default Navbar;
