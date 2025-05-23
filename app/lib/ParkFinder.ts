async function query_parking_lots(
  lat: number,
  lon: number,
  radius: number
): Promise<any> {
  const res = await fetch(
    `/api/neon?city=hsinchu&lon=${lon}&lat=${lat}&radius=${radius}`
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
  const { location } = args;
  //const IQ_API_KEY = process.env.IQ_API_KEY as string;

  try {
    const response = await fetch(
      `https://us1.locationiq.com/v1/search?key=pk.0a358f8fc5b7e525abaf3b0e88b4b4d7&q=${encodeURIComponent(
        location
      )}&format=json`
    );

    if (!response.ok) {
      throw new Error(`LocationIQ API error: ${response.status}`);
    }

    const result = await response.json();

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

async function fetch_parking_data(parkNear: any): Promise<any> {
  const parkRealTime = await fetch(
    'neon_test_hc.json'
  ).then((res) => res.json());
  const parkData = await fetch("data/hsinchu.json").then((res) => res.json());

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
  latitude: number;
  longitude: number;
  radius: number;
}

async function parking_lots_finder(args: ParkingLotsFinderArgs): Promise<any> {
  const { latitude, longitude, radius } = args;
  try {
    const parkNear = await query_parking_lots(latitude, longitude, radius);
    return fetch_parking_data(parkNear);
  } catch (error) {
    console.error("Error in parking_lots_finder:", error);
    throw error;
  }
}

const INSTRUCTION_PROMPT = `
you are a helpful function calling Model.
Don't generate any content and follow the instruction.
Only call one function at a time.
Information:
Avaliable District: [Hsinchu]
Follow the instruction below:
1. call locationIQ_search(location), you will get lat, lon ,address.
2. check district avalibility by address, if not in the list, return to user, proccess stop.
3. call parking_lots_finder(latitude, longitude, radius)
`;
const OUTPUT_PROMPT = `you are a helpful assistant that can find parking information:
Show the parking lots realtime information in your way.
Show The Google Map embed of the best parking lot you think.
The data is below:
`;

export default async function ParkFinder(userPrompt: string): Promise<any> {
  const FUNCTION_SCHEMA = await fetch("data/function_schema.json").then((res) =>
    res.json()
  );
  console.log("Function schema:", FUNCTION_SCHEMA);
  const MODEL = "model/Llama-3.1-Nemotron-8B-UltraLong-4M-Instruct.Q8_0.gguf";
  const FUNCTION_MAP = {
    locationIQ_search,
    parking_lots_finder,
  };

  let messages = [
    {
      role: "system",
      content: INSTRUCTION_PROMPT + "\nNo function calls yet.",
    },
    { role: "user", content: userPrompt },
  ];

  let response: any;
  let toolCalls: any[] = [];
  let query = userPrompt;
  let msg: any;
  let functionCall: any;
  let functionName: string;
  let args: any;
  let callResult: any;

  console.log("Messages1:", messages);
  response = await fetch(
    process.env.NODE_ENV === "development"
      ? "http://localhost:8080/v1/chat/completions"
      : "https://social-husky-discrete.ngrok-free.app/v1/chat/completions",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages,
        tools: FUNCTION_SCHEMA,
        tool_choice: "auto",
      }),
    }
  ).then((res) => res.json());
  console.log("Response1:", response);

  toolCalls = response?.choices?.[0]?.message?.tool_calls ?? [];
  functionCall = toolCalls[0].function;
  functionName = functionCall.name;
  args = JSON.parse(functionCall.arguments);
  callResult = await FUNCTION_MAP[functionName as keyof typeof FUNCTION_MAP](
    args
  );
  messages = [
    {
      role: "system",
      content: INSTRUCTION_PROMPT + "\nStep 1 Result: " + JSON.stringify(callResult),
    },
    { role: "user", content: userPrompt },
  ];
//---------
  console.log("Messages2:", messages);
  response = await fetch(
    process.env.NODE_ENV === "development"
      ? "http://localhost:8080/v1/chat/completions"
      : "https://social-husky-discrete.ngrok-free.app/v1/chat/completions",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages,
        tools: FUNCTION_SCHEMA,
        tool_choice: "auto",
      }),
    }
  ).then((res) => res.json());
  console.log("Response2:", response);

  messages = [
    { role: "system", content: OUTPUT_PROMPT + msg },
    { role: "user", content: userPrompt },
  ];
  toolCalls = response?.choices?.[0]?.message?.tool_calls ?? [];
  functionCall = toolCalls[0].function;
  functionName = functionCall.name;
  args = JSON.parse(functionCall.arguments);
  callResult = await FUNCTION_MAP[functionName as keyof typeof FUNCTION_MAP](
    args
  );
  messages = [
    {
      role: "system",
      content: OUTPUT_PROMPT + "\nStep 3 Result: " + JSON.stringify(callResult),
    },
    { role: "user", content: userPrompt },
  ];
  console.log("Messages3:", messages);
  //---------
  response = await fetch(
    process.env.NODE_ENV === "development"
      ? "http://localhost:8080/v1/chat/completions"
      : "https://social-husky-discrete.ngrok-free.app/v1/chat/completions",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages,
      }),
    }
  ).then((res) => res.json());
  console.log("Response3:", response);

  // Final response is the formatted output
  return response?.choices?.[0]?.message?.content;
}
