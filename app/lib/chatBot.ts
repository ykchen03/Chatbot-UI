import { systemPrompts, PromptTypes } from "./prompts";
export default async function ChatBot(
  promptType: PromptTypes,
  userPrompt: string,
  chatHistory?: string,
  systemPrompt?: string,
  tools: any[] = [],
): Promise<any> {
  systemPrompt = systemPrompt ?? systemPrompts[promptType];
  try {
    const data = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemPrompt: systemPrompt + " " + chatHistory || "",
        userPrompt: userPrompt,
        tools: tools,
      }),
    }).then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    });
    return data;
  } catch (error) {
    console.error("Error:", error);
    return `Sorry, I couldn't process that. Error: ${error}`;
  }
}