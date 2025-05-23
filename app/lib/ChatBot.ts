import { systemPrompts, PromptTypes } from "./prompts";
export default async function generateBotResponse(
  promptType: PromptTypes,
  userPrompt: string,
  chatHistory: string,
  systemPrompt: string | undefined = systemPrompts[promptType],
): Promise<string> {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemPrompt: systemPrompt,
        chatHistory: chatHistory,
        userPrompt: userPrompt,
      }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
    return `Sorry, I couldn't process that. Error: ${error}`;
  }
}
