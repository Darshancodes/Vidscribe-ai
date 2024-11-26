import { authMiddleware } from "@clerk/nextjs";
 
export default authMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: ["/", "/api/(.*)"],
  // Routes that can always be accessed, and have
  // no authentication information
  ignoredRoutes: ["/no-auth-in-this-route/(.*)"]
});
 
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};