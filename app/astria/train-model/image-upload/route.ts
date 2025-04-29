import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const supabase = createServerComponentClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const body = await request.json();

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["image/jpeg", "image/png", "image/gif"],
        tokenPayload: JSON.stringify({ userId: user.id }),
      }),
      onUploadCompleted: async ({ blob }) => {
        console.log("Upload completed:", blob.url);
        // Add additional logic here if needed
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}