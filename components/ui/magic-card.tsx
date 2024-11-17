"use client";

import React, { useCallback, useEffect } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { Particles } from "../ui/particles";

import { cn } from "@/functions";

export interface Props extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    gradientSize?: number;
    gradientColor?: string;
    borderColor?: string;
    particles?: boolean;
    count?: number;
}

export default function MagicCard({
    children,
    particles = false,
    count = 20,
}: Props) {
    const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { currentTarget } = e;
        const rect = currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        currentTarget.style.setProperty('--pos-x', `${x}px`);
        currentTarget.style.setProperty('--pos-y', `${y}px`);
    };

    return (
        <div className="card rounded-xl lg:rounded-2xl overflow-hidden" onMouseMove={onMouseMove}>
            <div className="content">
                {particles && (
                    <Particles
                        className="absolute inset-0 w-full h-full z-10"
                        quantity={count}
                        ease={80}
                        color="#d4d4d8"
                        refresh
                    />
                )}
                {children}
            </div>
        </div>
    );
};