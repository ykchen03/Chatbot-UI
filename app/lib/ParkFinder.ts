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
      "api/location?location=" + encodeURIComponent(location + " Taiwan")
    ).then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    });
    console.log("LocationIQ result:", result);

    return [
      {
        lat: parseFloat(result[0].lat || NaN),
        lon: parseFloat(result[0].lon || NaN),
        address: result[0].display_name || "",
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
  console.log("ParkRealTime: ", parkRealTime);
  const parkData = await fetch(`data/${city.toLowerCase()}.json`).then((res) =>
    res.json()
  );

  const result = parkNear.data.map((park: any, index: number) => {
    const lot =
      city === "Hsinchu"
        ? parkRealTime.find((p: any) => p.PARKNO === park.name)
        : parkRealTime.ParkingAvailabilities.find(
            (p: any) => p.CarParkID === park.name
          );
    const pData = parkData.find((p: any) => p.id === park.name);

    return {
      name: (lot?.PARKINGNAME || pData?.name) ?? "",
      address: lot?.ADDRESS ?? "",
      price: pData?.price ?? "",
      recharge: pData?.recharge ?? "",
      distance: park.distance,
      lat: (lot?.LATITUDE || pData.lat) ?? null,
      lon: (lot?.LONGITUDE || pData.lon) ?? null,
      freequantity: (lot?.FREEQUANTITY || lot?.AvailableSpaces) ?? null,
      totalquantity: (lot?.TOTALQUANTITY || lot?.TotalSpaces) ?? null,
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
    console.log("ParkNear: ",parkNear);
    return fetch_parking_data(parkNear, city);
  } catch (error) {
    console.error("Error in parking_lots_finder:", error);
    throw error;
  }
}

//Please found the parking lots around Hsinchu train station about 500 meters
//Please found the parking lots around Taipei 101 about 500 meters
//請找出台北101附近500公尺內的停車場

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
    `You are a function-calling model for extracting geographic locations.

Your task:
1. Extract only the location name (as a clean string, in English) from user input.
2. Do not include additional context (e.g., "parking within 500 meters" — this is incorrect).
3. Call \`locationIQ_search(location: string)\` with ONLY the location name, like "Taipei 101", "Hsinchu train station", etc.

Important Rules:
- Do not generate any explanation or chat text when calling functions.
- If the input is NOT about finding parking near a location, do not call any function — instead, return a short reason to the user.
- Only one function call is allowed.
- Do not modify or interpret the user input. Extract only the place name.

Examples (Correct):
- User: "Find parking near Taipei 101"
  → Call: locationIQ_search("Taipei 101")

- User: "I need parking near Hsinchu High-Speed Rail"
  → Call: locationIQ_search("Hsinchu High-Speed Rail")

Examples (Incorrect):
- ❌ "Taipei 101 parking within 500 meters"
- ❌ "Find me lots near the train"`,

    `You are a function-calling model for searching parking lots.

Supported cities:
["Keelung", "Taipei", "Taoyuan", "Hsinchu", "Taichung", "Changhua", "Tainan", "Kaohsiung"]

Your task:
- If the location (city) is **not in the list**, return a reason to the user — do NOT call any function.
- If the location is in the list, call:

  \`parking_lots_finder(city: string, latitude: number, longitude: number, radius: number)\`

  Rules:
  1. \`city\` must exactly match one of the names in the list (case-sensitive).
  2. Use the given coordinates (latitude & longitude).
  3. Use a default \`radius\` of 500 meters if not specified by the user.

Additional:
- If the address or coordinates are missing (LocationIQ failed), return an error message instead of calling the function.
- Do not generate or include any text response — only call the function with JSON.
- Only one function call is allowed per request.

Data is below:`,
    `You are a assistant for Searching Parking lot.
  Show the parking lots realtime information in your way.
  Show Google map direction link of the best parking lot you think.
  If the data is empty, mean no parking lot around the location, return the reason to user in your way.
  The parking lot data is below:`,
  ];
  let callReturn: string = "";
  let response: any;
  for (let i = 0; i < SYSTEM_PROMPT.length; i++) {
    console.log("Current prompt:", SYSTEM_PROMPT[i] + " " + callReturn);
    response = await ChatBot(
      "parkFinder",
      userPrompt,
      undefined,
      SYSTEM_PROMPT[i] + " " + callReturn,
      [FUNCTION_SCHEMA[i]]
    );
    console.log("Response:", response);
    const toolCalls = response?.choices?.[0]?.message?.tool_calls ?? [];
    if (toolCalls.length === 0) {
      return response || "I can't help you with that.";
    }
    const functionCall = toolCalls[0].function;
    const functionName = functionCall.name as FunctionMapKey;
    const functionArgs = JSON.parse(functionCall.arguments);
    if (FUNCTION_MAP[functionName]) {
      callReturn = JSON.stringify(
        await FUNCTION_MAP[functionName](functionArgs)
      );
      console.log("Function call return:", callReturn);
    } else {
      throw new Error(`Function ${functionName} is not defined.`);
    }
  }
  return response;
}
