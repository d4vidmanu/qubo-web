import { parse } from 'cookie'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1) extraer cookie HttpOnly
  const cookies = parse(req.headers.cookie ?? '')
  const token = cookies.token as string

  if (!token) {
    return res.status(401).json({ error: 'No auth token' })
  }

  // 2) reconstruir path
  const pathParam = Array.isArray(req.query.path)
    ? req.query.path.join('/')
    : req.query.path || ''

  // 3) armar URL final
  const url = `${process.env.NEXT_PUBLIC_USER_API_URL}/${process.env.NEXT_PUBLIC_USER_API_STAGE}/${pathParam}`

  // 4) reenviar petición a Lambda
  const lambdaRes = await fetch(url, {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
    },
    body: ['GET','HEAD'].includes(req.method || '') ? undefined : JSON.stringify(req.body),
  })

  // 5) devolver status y body al cliente
  const text = await lambdaRes.text()
  res.status(lambdaRes.status).send(text)
}
