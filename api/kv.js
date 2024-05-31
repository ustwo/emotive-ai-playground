import { kv } from '@vercel/kv';
 
export default async function handler(request, response) {
//    const user = await kv.hset("visitor:smcarustwo", ["agent", "1", "finish", "1"]);
//    const user = await kv.hgetall('visitor:smcarustwo');
    return response.status(200).json(user);
}