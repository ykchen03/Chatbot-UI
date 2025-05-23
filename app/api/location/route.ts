import type { NextRequest } from 'next/server'
export async function GET(req: NextRequest): Promise<Response> {
    try {
        const searchParams = req.nextUrl.searchParams;
        const location = searchParams.get("location") || "";
        const res = await fetch(`https://us1.locationiq.com/v1/search?key=${process.env.LOCATIONIQ_API_KEY}&q=${encodeURIComponent(
        location
      )}&format=json`).then((res) => res.json());
        if (!res.length) {
            return Response.json({ error: "No results found for this location" }, { status: 404 });
        }
        const data = {
            lat: parseFloat(res[0].lat),
            lon: parseFloat(res[0].lon),
            address: res[0].display_name,
        };
        return Response.json(data, { status: 200 });
    } catch (error) {
        console.error("Error in locationIQ_search:", error);
        return Response.json({ error: "Failed to fetch location data" }, { status: 500 });
    }
}