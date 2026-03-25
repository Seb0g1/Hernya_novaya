import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  // req.auth.user может быть {} — в JS !!{} === true, снова цикл редиректов
  const u = req.auth?.user;
  const isLoggedIn = Boolean(
    (typeof u?.email === "string" && u.email.length > 0) ||
      (typeof u?.id === "string" && u.id.length > 0),
  );
  const isLogin = req.nextUrl.pathname.startsWith("/login");
  if (!isLoggedIn && !isLogin) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(login);
  }
  if (isLoggedIn && isLogin) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*"],
};
