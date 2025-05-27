export async function POST(request: Request): Promise<Response> {
  try {
    const { systemPrompt, userPrompt, tools } = await request.json();
    const data = await fetch(
      process.env.NODE_ENV === "development"
        ? "http://localhost:8080/v1/chat/completions"
        : "https://social-husky-discrete.ngrok-free.app/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "model/Llama-3.1-Nemotron-8B-UltraLong-4M-Instruct.Q8_0.gguf",
          messages: [
            {
              role: "system",
              content: `${systemPrompt}`,
            },
            {
              role: "user",
              content: userPrompt,
            },
          ],
          tools: tools,
        }),
      }
    ).then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    });
    return new Response(JSON.stringify(data), {
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
