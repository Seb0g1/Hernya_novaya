import { auth } from "@/auth";
import { buildYoutubeAuthorizeUrl } from "@/lib/youtube-oauth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const state = randomBytes(24).toString("hex");
    const jar = await cookies();
    jar.set("youtube_oauth_state", state, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 600,
      secure: process.env.NODE_ENV === "production",
    });
    const url = buildYoutubeAuthorizeUrl(state);
    return NextResponse.redirect(url);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "oauth_config";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
