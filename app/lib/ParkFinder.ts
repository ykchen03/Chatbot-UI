import ChatBot from "./ChatBot";
async function query_parking_lots(
  city: string,
  lat: number,
  lon: number,
  radius: number
): Promise<any> {
  city = city.toLowerCase();
  const res = await fetch(
    `/api/neon?city=${city}&lon=${lon}&lat=${lat}&radius=${radius}`
  );
  if (!res.ok) throw new Error("Failed to fetch database data");
  const data = await res.json();
  return data;
}

interface LocationIQSearchArgs {
  location: string;
}

interface LocationIQResult {
  lat: number;
  lon: number;
  address: string;
}

async function locationIQ_search(
  args: LocationIQSearchArgs
): Promise<LocationIQResult[]> {
  console.log("locationIQ_search args:", args);
  const { location } = args;
  try {
    const result = await fetch(
      "api/location?loctation=" + encodeURIComponent(location)
    ).then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    });

    if (!result.length) {
      throw new Error("No results found for this location");
    }

    return [
      {
        lat: parseFloat(result[0].lat),
        lon: parseFloat(result[0].lon),
        address: result[0].display_name,
      },
    ];
  } catch (error) {
    console.error("Error in locationIQ_search:", error);
    throw error;
  }
}

async function fetch_parking_data(parkNear: any, city: string): Promise<any> {
  const parkRealTime =
    city === "Hsinchu"
      ? await fetch("api/hccg").then((res) => res.json())
      : await fetch(`/api/tdx?city=${city}`).then((res) => res.json());
  const parkData = await fetch(`data/${city.toLowerCase()}.json`).then((res) =>
    res.json()
  );

  const result = parkNear.data.map((park: any, index: number) => {
    const lot = parkRealTime.find((p: any) => p.PARKNO === park.name);
    const pData = parkData.find((p: any) => p.id === park.name);

    return {
      name: lot?.PARKINGNAME ?? "",
      address: lot?.ADDRESS ?? "",
      price: pData?.price ?? "",
      recharge: pData?.recharge ?? "",
      distance: park.distance,
      lat: lot?.LATITUDE ?? null,
      lon: lot?.LONGITUDE ?? null,
      freequantity: lot?.FREEQUANTITY ?? null,
      totalquantity: lot?.TOTALQUANTITY ?? null,
    };
  });

  return result;
}

interface ParkingLotsFinderArgs {
  city: string;
  latitude: number;
  longitude: number;
  radius: number;
}

async function parking_lots_finder(args: ParkingLotsFinderArgs): Promise<any> {
  console.log("parking_lots_finder args:", args);
  const { city, latitude, longitude, radius } = args;
  try {
    const parkNear = await query_parking_lots(
      city,
      latitude,
      longitude,
      radius
    );
    return fetch_parking_data(parkNear, city);
  } catch (error) {
    console.error("Error in parking_lots_finder:", error);
    throw error;
  }
}

//Please found the parking lots around Hsinchu train station about 500 meters

export default async function ParkFinder(userPrompt: string): Promise<any> {
  const FUNCTION_SCHEMA = await fetch("data/function_schema.json").then((res) =>
    res.json()
  );
  const FUNCTION_MAP = {
    locationIQ_search: locationIQ_search,
    parking_lots_finder: parking_lots_finder,
  } as const;

  type FunctionMapKey = keyof typeof FUNCTION_MAP;
  const SYSTEM_PROMPT = [
    `You are a Function Calling Model for getting location info.
  Parse the name of location and call locationIQ_search(location: string).
  If user prompt is no related to parking lot, return the reason to user in your way.
  Do not call other function or skip the function call.
  Generate text response is not allowed.`,
    `You are a Function Calling Model for Searching Parking lot.
  You got the address and coordiante of the location.
  Supportted city list: [Keelung,Taipei,Taoyuan,Hsinchu,Taichung,Changhua,Tainan,Kaohsuing]
  If the address is not in the list, return the reason to user in your way.
  Else, pick one city in the list and call parking_lots_finder(city: city, latitude: number, longitude: number, radius: number(meter)).
  (The string of city must mathch the city in the list, case sensitive)
  Do not call other function or skip the function call.
  Generate text response is not allowed.
  The data is below:`,
    `You are a assistant for Searching Parking lot.
  Show the parking lots realtime information in your way.
  Show The Bing Map embed of the best parking lot you think.
  The data is below:`,
  ];

  let callReturn: string = "";
  for (const prompt of SYSTEM_PROMPT) {
    const response = await ChatBot(
      "parkFinder",
      userPrompt,
      prompt,
      undefined,
      FUNCTION_SCHEMA
    );
    console.log("Response:", response);
    const toolCalls = response?.choices?.[0]?.message?.tool_calls ?? [];
    if (toolCalls.length === 0) {
      return (
        response?.choices?.[0]?.message?.content ||
        "I can't help you with that."
      );
    }
    const functionCall = toolCalls[0].function;
    const functionName = functionCall.name as FunctionMapKey;
    const functionArgs = functionCall.arguments;
    if (FUNCTION_MAP[functionName]) {
      callReturn = JSON.stringify(
        await FUNCTION_MAP[functionName](functionArgs)
      );
    } else {
      throw new Error(`Function ${functionName} is not defined.`);
    }
  }
  return callReturn;
}
