import authApiRequest from "@/apiRequests/auth";
import { HttpError } from "@/lib/http";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("sessionToken");
  if (!sessionToken)
    return Response.json(
      { message: "Không nhận được session token" },
      { status: 401 }
    );
  try {
    const res = await authApiRequest.slideSessionFromNextServertoServer(
      sessionToken.value
    );
    const newExpiresDate = new Date(res.payload.data.expiresAt).toISOString();
    return Response.json(res.payload, {
      status: 200,
      headers: {
        "Set-Cookie": `sessionToken=${sessionToken.value}; Path=/; HttpOnly; Expires=${newExpiresDate}; SameSite=Lax; Secure`,
      },
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return Response.json(error.payload, {
        status: error.status,
      });
    } else {
      return Response.json({ message: "Lỗi không xác định" }, { status: 500 });
    }
  }
}
