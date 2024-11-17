import React from "react";
import { cn } from "@/functions";
import Providers from "@/components/global/providers"; // Your custom Providers
import "@/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs"; // Only import ClerkProvider here
import MarketingLayout from "./marketinglayout"; // Assuming MarketingLayout is in the layouts folder

interface Props {
    children: React.ReactNode;
}

const RootLayout = ({ children }: Props) => {
    return (
        <html lang="en">
            <head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>Vidscribe</title>
            </head>
            <body
                className={cn(
                    "min-h-screen bg-background text-foreground antialiased font-default overflow-x-hidden !scrollbar-hide",
                )}
            >
                {/* Only one <ClerkProvider> at the root level */}
                <ClerkProvider>
                    
                        {/* MarketingLayout is fine to render children but doesn't wrap with ClerkProvider */}
                        <MarketingLayout>{children}</MarketingLayout>
                
                </ClerkProvider>
            </body>
        </html>
    );
};

export default RootLayout;
