export async function POST(request: Request): Promise<Response> {
    try {
    const { systemPrompt, chatHistory, userPrompt } = await request.json();
    /* const response = await fetch("https://social-husky-discrete.ngrok-free.app/v1/chat/completions", { */
    const response = await fetch("http://localhost:8080/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "model/Llama-3.1-Nemotron-8B-UltraLong-4M-Instruct.Q8_0.gguf",
        messages: [
          {
            role: "system",
            content: `${systemPrompt} ${chatHistory}`,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
      }),
    });
    const data = await response.json();
    return new Response(JSON.stringify(data.choices[0].message.content), {
        status: 200,
        });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return Response.json({error: errorMessage}, {status: 500});
  }
}