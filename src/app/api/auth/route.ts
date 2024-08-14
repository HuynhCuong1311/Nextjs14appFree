import { decodeJWT } from "@/lib/utils";

// type PayloadJWT = {
//   tokenType: string;
//   iat: number;
//   exp: number;
//   userId: number;
// };

export async function POST(request: Request) {
  const body = await request.json();
  const sessionToken = body.sessionToken as string;
  const expiresAt = body.expiresAt as string;
  if (!sessionToken)
    return Response.json(
      { message: "Không nhận được session token" },
      { status: 400 }
    );
  // const payload = decodeJWT<PayloadJWT>(sessionToken);
  const expiresDate = new Date(expiresAt).toUTCString();
  return Response.json(body, {
    status: 200,
    headers: {
      "Set-Cookie": `sessionToken=${sessionToken}; Path=/; HttpOnly; Expires=${expiresDate}; SameSite=Lax; Secure`,
    },
  });
}
