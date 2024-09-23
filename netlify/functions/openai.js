import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.VITE_OPENAI_API_KEY });

async function main(message) {
  const model = message?.model ?? "gpt-4";
  const messages = message?.messages ?? "";

  const completion = await openai.chat.completions.create({
    model,
    messages,
  });

  return completion.choices[0].message.content;
}

export async function handler(event, context) {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Request body is missing" }),
      };
    }

    let requestBody;
    try {
      requestBody = JSON.parse(event.body);
    } catch (parseError) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid JSON in request body" }),
      };
    }

    console.log("Received request:", requestBody);

    const message = await main(requestBody);

    console.log("Generated message:", message);

    return {
      statusCode: 200,
      body: JSON.stringify(message),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "An error occurred processing your request",
        details: error.message,
      }),
    };
  }
}
