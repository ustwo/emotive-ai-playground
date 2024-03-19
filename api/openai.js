import OpenAI from "openai";

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY})

async function main() {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: "You are a helpful assistant." }],
    model: "gpt-3.5-turbo",
  });

  return completion.choices[0].message.content
}

export function GET(request) {
    return new Response(main())
    console.log(request)
}

export const config = {
}