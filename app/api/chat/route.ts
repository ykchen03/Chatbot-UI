import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1'
});

// Simple delay function
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 5000; // 5 seconds between requests

export async function POST(request: Request): Promise<Response> {
  try {
    // Calculate time since last request
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    // If not enough time has passed, wait
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.log(`Waiting for ${waitTime} ms before processing the next request.`);
      await delay(waitTime);
    }
    
    // Update last request time
    lastRequestTime = Date.now();

    const { systemPrompt, userPrompt, tools } = await request.json();
    
    const requestBody: any = {
      model: "nvidia/llama-3.1-nemotron-ultra-253b-v1",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    };

    if (tools[0] && Array.isArray(tools) && tools.length > 0) {
      requestBody.tools = tools;
      requestBody.tool_choice = "auto";
    }

    const response = await openai.chat.completions.create(requestBody);
    
    return new Response(JSON.stringify(response), {
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in POST /api/chat:", errorMessage);
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}