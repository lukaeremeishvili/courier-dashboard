import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const userData = req.cookies.get("userData");

  if (!userData || !userData.value) {

    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const parsedUserData = JSON.parse(decodeURIComponent(userData.value));
  const { role } = parsedUserData;


  if (req.nextUrl.pathname === "/register" || req.nextUrl.pathname === "/login") {
    return NextResponse.next();
  }


  const url = req.nextUrl.clone();
  const pathname = url.pathname;


  if (role === "admin" && pathname.startsWith("/dashboard/user")) {
    url.pathname = "/dashboard/admin";
    return NextResponse.redirect(url);
  }

  if (role === "courier" && pathname.startsWith("/dashboard/user")) {
    url.pathname = "/dashboard/courier";
    return NextResponse.redirect(url);
  }

  if (role === "user" && pathname.startsWith("/dashboard/courier")) {
    url.pathname = "/dashboard/user";
    return NextResponse.redirect(url);
  }


  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/admin",
    "/dashboard/courier",
    "/dashboard/user",
    "/dashboard/((?!admin|courier|user).*)",
  ],
};