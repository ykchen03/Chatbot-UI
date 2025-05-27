import { NextRequest } from "next/server";

let cachedToken: any = null;
let tokenExpiration: any = null;

export async function GET(req: NextRequest): Promise<Response> {
  const searchParams = req.nextUrl.searchParams;
  const city = searchParams.get("city");

  if (!city) {
    return Response.json(
      { error: "Invalid query parameters" },
      { status: 400 }
    );
  }

  try {
    if (!cachedToken || Date.now() >= tokenExpiration) {
      const authResponse = await fetch(
        "https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept-Encoding": "br,gzip",
          },
          body: new URLSearchParams({
            grant_type: "client_credentials",
            client_id: process.env.TDX_CLIENT_ID || "",
            client_secret: process.env.TDX_CLIENT_SECRET || "",
          }),
        }
      );

      const authData = await authResponse.json();
      if (!authData.access_token) {
        return Response.json(
          { error: "Failed to get access token" },
          { status: 500 }
        );
      }

      cachedToken = authData.access_token;
      tokenExpiration = Date.now() + authData.expires_in * 1000;
    }

    const Res = await fetch(
      `https://tdx.transportdata.tw/api/basic/v1/Parking/OffStreet/ParkingAvailability/City/${city}?%24select=CarParkID%2CAvailableSpaces&%24format=JSON`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${cachedToken}`,
          "Accept-Encoding": "br,gzip",
        },
      }
    );
    const Data = await Res.json();
    return Response.json(Data, { status: 200 });
  } catch (error) {
    console.error("Error fetching data:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
