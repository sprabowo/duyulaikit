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
  const { authorization, 'x-session-id': sessionId } = req.headers
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
    const isUserAlreadyVoted = loadFromStorage[namespace]['user'].find(user => user.id === sessionId && user.voteId === id)

    let votedValue
    let total
    if (!getId || !isUserAlreadyVoted) {
      loadFromStorage[namespace]['user'].push({
        id: sessionId,
        voteId: id,
        voteDirection: -1
      })
      votedValue = -1
      loadFromStorage[namespace][type].push({
        id,
        total: -1
      })
      total = -1
    } else {
      loadFromStorage[namespace][type].forEach(data => {
        if (data.id === id) {
          data.total = isUserAlreadyVoted.voteDirection === 1 ? data.total - 2 : isUserAlreadyVoted.voteDirection === 0 ? data.total - 1 : data.total + 1
          total = data.total
        }
      });
      loadFromStorage[namespace]['user'].forEach(data => {
        if (data.id === sessionId && data.voteId === id) {
          data.voteDirection = isUserAlreadyVoted.voteDirection >= 0 ? -1 : 0
          votedValue = data.voteDirection
        }
      });
    }

    await cls.setItem(CLSKEY, { ...loadFromStorage }, CLSTOKEN)

    return {
      ...responseData, data: {
        id, attributes: {
          total_score: total,
          user_vote_direction: votedValue,
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
  res.json(await checkInStorage(namespace, id, 'updown_button'))
}