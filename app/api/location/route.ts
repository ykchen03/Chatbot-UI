import type { NextRequest } from "next/server";
export async function GET(req: NextRequest): Promise<Response> {
  try {
    const searchParams = req.nextUrl.searchParams;
    const location = searchParams.get("location") || "";
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search.php?q=${encodeURIComponent(location)}&format=jsonv2`
      /*`https://us1.locationiq.com/v1/search?key=${process.env.LOCATIONIQ_API_KEY}&q=${encodeURIComponent(location)}&format=json`*/
    ).then((res) => res.json());
    return Response.json(res, { status: 200 });
  } catch (error) {
    console.error("Error in locationIQ_search:", error);
    return Response.json(
      { error: "Failed to fetch location data" },
      { status: 500 }
    );
  }
}
