export function GET(request: Request) {
    return new Response(`Hello from ${process.env.SMC_VAR}`)
    console.log(request)
}

export const config = {
}