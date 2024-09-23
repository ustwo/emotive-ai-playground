import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.VITE_OPENAI_API_KEY });

async function main(message) {
  let outgoingMessage = "You are a helpful assistant.";
  if (message != undefined) {
    outgoingMessage = message;
  }

  const completion = await openai.chat.completions.create(message);

  return completion.choices[0].message.content;
}

export default async function (request, response) {
  let completion = JSON.parse(request.body);
  console.log(completion);
  const message = await main(completion);
  console.log(message);
  response.status(200).send(message);
  // return new Response()
}

export const config = {};
