import { NowRequest, NowResponse } from '@vercel/node'

export default function (_: NowRequest, res: NowResponse) {
  res.send(`Duyulaikit - This is experimental and for fun only!`)
}