import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Admin portal routes
    if (path.startsWith("/admin/dashboard")) {
      // Check if user has admin or delivery role
      if (!token?.role || (token.role !== "ADMIN" && token.role !== "DELIVERY")) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
    }

    // Customer routes (checkout, account)
    if (path.startsWith("/checkout") || path.startsWith("/account")) {
      // Check if user is a customer (not admin/delivery)
      if (token?.role && token.role !== "CUSTOMER") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        
        // Admin dashboard requires authentication with admin/delivery role
        if (path.startsWith("/admin/dashboard")) {
          return !!token && (token.role === "ADMIN" || token.role === "DELIVERY");
        }
        
        // Customer routes require authentication
        if (path.startsWith("/checkout") || path.startsWith("/account")) {
          return !!token;
        }
        
        return true;
      },
    },
    pages: {
      signIn: "/auth",
    },
  }
);

export const config = {
  matcher: ["/checkout", "/account", "/admin/dashboard/:path*"],
};

