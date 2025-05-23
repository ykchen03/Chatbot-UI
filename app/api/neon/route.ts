import { neon } from "@neondatabase/serverless";
import type { NextRequest } from 'next/server'

const sql = neon(process.env.DATABASE_URL || "");

export async function GET(req: NextRequest): Promise<Response> {
  const searchParams = req.nextUrl.searchParams;
  const city = searchParams.get("city");
  const lon = searchParams.get("lon");
  const lat = searchParams.get("lat");
  const radius = searchParams.get("radius");
  
  const longitude = parseFloat(lon || "0");
  const latitude = parseFloat(lat || "0");
  const searchRadius = parseFloat(radius || "0");
  
  if (!city || isNaN(longitude) || isNaN(latitude) || isNaN(searchRadius)) {
    return Response.json({ error: "Invalid query parameters" }, { status: 400 });
  }

  try {
    const timestamp = new Date().toISOString();
    //const data = await sql`SELECT version()`
    const data = await sql`
      SELECT name, distance
      FROM (
        SELECT name,
        ST_Distance(location, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography) AS distance
        FROM ${sql.unsafe(city)}
      ) AS subquery
      WHERE distance <= ${searchRadius}
    `;
    console.log(data);
    return Response.json({
      data,
      timestamp,
      meta: {
        lat: latitude,
        lon: longitude,
        radius: searchRadius,
        city
      }
    }, { status: 200 });
  } catch (error) {
    return Response.json({ 
      error: error instanceof Error ? error.message : "Unknown database error" 
    }, { status: 500 });
  }
}
