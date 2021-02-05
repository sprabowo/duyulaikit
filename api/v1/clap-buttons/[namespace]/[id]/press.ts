import { NowRequest, NowResponse } from '@vercel/node'
import cls from 'cloud-local-storage'
import { CLSTOKEN, CLSKEY, APIKEY } from '../../../../utils'

export default async function (req: NowRequest, res: NowResponse) {
  const responseData = {
    data: {
      attributes: {},
      id: null,
      type: "batch",
    }
  }
  const { namespace, id } = req.query
  const { authorization } = req.headers
  const token = authorization.split('Bearer ')[1]
  if (!authorization || !token) {
    res.status(401);
    return res.json({ error: 'Unauthorized' })
  }
  if (token !== APIKEY) {
    res.status(403);
    return res.json({ error: 'Forbidden' })
  }
  if (!req.body || req.method !== 'PUT' || !namespace || !id) {
    res.status(400);
    return res.json({ error: 'Bad request' })
  }

  let loadFromStorage = await cls.getItem(CLSKEY, CLSTOKEN)
  const defaultData = { "updown_button": [], "clap_button": [], "like_button": [], "user": [] }

  const checkInStorage = async (namespace = 'demo', id, type) => {
    if (!loadFromStorage.hasOwnProperty(namespace))
      await cls.setItem(CLSKEY, { ...loadFromStorage, [namespace]: { ...defaultData } }, CLSTOKEN)

    const getId = loadFromStorage[namespace][type].find(data => data.id === id)
    let total
    if (!getId) {
      loadFromStorage[namespace][type].push({
        id,
        total: 1
      })
      total = 1
    } else {
      loadFromStorage[namespace][type].forEach(data => {
        if (data.id === id) {
          data.total += 1
          total = data.total
        }
      });
    }

    await cls.setItem(CLSKEY, { ...loadFromStorage }, CLSTOKEN)

    return {
      ...responseData, data: {
        id, attributes: {
          total_claps: total,
          user_has_voted: true,
          user_claps: 1,
          namespace
        },
        type
      }
    }
  }

  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )
  res.status(201)
  res.json(await checkInStorage(namespace, id, 'clap_button'))
}