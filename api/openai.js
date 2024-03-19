import OpenAI from "openai";

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY})

async function main(message) {

    let outgoingMessage = "You are a helpful assistant."
    if (message != undefined) {
        outgoingMessage = message
    }

    const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: outgoingMessage }],
        model: "gpt-3.5-turbo",
    });

  return completion.choices[0].message.content
}

export default async function (request, response) {
    console.log(request.query.msg)
    const message = await main(request.query.msg)
    console.log(message)
    response.status(200).send(message)
    // return new Response()
}

export const config = {
}