import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  // Public routes that can be accessed without authentication
  publicRoutes: [
    "/", 
    "/sign-in(.*)", 
    "/sign-up(.*)", 
    "/api(.*)"
  ],
  
  // Routes that require authentication
  afterAuth(auth, req) {
    // If user is not authenticated and trying to access a non-public route
    if (!auth.userId && !auth.isPublicRoute) {
      return redirectToSignIn({ 
        returnBackUrl: req.url 
      });
    }
    
    // Redirect to dashboard after successful sign-in/sign-up if on sign-in/sign-up pages
    if (auth.userId && 
        (req.nextUrl.pathname.startsWith("/sign-in") || 
         req.nextUrl.pathname.startsWith("/sign-up"))) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif)$).*)'
  ]
};