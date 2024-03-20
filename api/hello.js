export default async function (request, response) {
    console.log(request.body)
    response.status(200).send("hello")
}

export const config = {
}