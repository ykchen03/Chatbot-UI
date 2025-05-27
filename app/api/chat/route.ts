import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1'
});
export async function POST(request: Request): Promise<Response> {
  try {
    const { systemPrompt, userPrompt, tools } = await request.json();
    
    const requestBody: any = {
      model: "nvidia/llama-3.1-nemotron-70b-instruct",
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

    // Only include tools if they are provided and non-empty
    if (tools && Array.isArray(tools) && tools.length > 0) {
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