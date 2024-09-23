import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.VITE_OPENAI_API_KEY });

async function main(message) {
  let outgoingMessage = "You are a helpful assistant.";
  if (message !== undefined && message.message) {
    outgoingMessage = message.message;
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ content: outgoingMessage }],
  });

  console.log("respoonseeee", completion);

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
