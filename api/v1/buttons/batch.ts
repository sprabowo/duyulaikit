import { NowRequest, NowResponse } from '@vercel/node'
import cls from 'cloud-local-storage'
import { CLSTOKEN, CLSKEY, APIKEY } from '../../utils'


export default async function (req: NowRequest, res: NowResponse) {
  const responseData = {
    data: {
      attributes: {
        responses: []
      },
      type: "batch",
    }
  }
  const batchResponseData = {
    data: {
      attributes: {},
      id: null,
      type: "batch",
    }
  }
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
  if (!req.body || req.method !== 'POST') {
    res.status(400);
    return res.json({ error: 'Bad gateway' })
  }

  const loadFromStorage = await cls.getItem(CLSKEY, CLSTOKEN)

  const checkInStorage = (namespace = 'demo', id, type) => {
    let totalKey
    let votedKey
    let votedValue = null
    switch (type) {
      case 'clap_button':
        totalKey = 'total_claps'
        votedKey = 'user_has_voted'
        break;
      case 'like_button':
        totalKey = 'total_likes'
        votedKey = 'user_has_liked'
        break;
      case 'updown_button':
        totalKey = 'total_score'
        votedKey = 'user_vote_direction'
        break;
      default:
        break;
    }
    if (!loadFromStorage.hasOwnProperty(namespace)) {
      return {
        ...batchResponseData, data: {
          id, attributes: {
            [totalKey]: 0,
            [votedKey]: votedKey === 'user_vote_direction' ? 0 : null
          }
        }
      }
    }
    const getId = loadFromStorage[namespace][type].find(data => data.id === id)
    const isUserAlreadyVoted = loadFromStorage[namespace]['user'].find(user => user.id === sessionId && user.voteId === id)
    switch (type) {
      case 'like_button':
        votedValue = isUserAlreadyVoted?.hasLiked
        break;
      case 'updown_button':
        votedValue = isUserAlreadyVoted?.voteDirection
        break;
      default:
        break;
    }

    if (getId) {
      return {
        ...batchResponseData, data: {
          id, attributes: {
            [totalKey]: getId.total,
            [votedKey]: votedValue,
            user_claps: 1
          }
        }
      }
    }
    return {
      ...batchResponseData, data: {
        id, attributes: {
          [totalKey]: 0,
          [votedKey]: votedValue,
          user_claps: 1
        }
      }
    }
  }

  const { data: { attributes: { urls } } } = req.body
  if (urls && urls.length > 0) {
    urls.forEach(url => {
      const splitUrl = url.split('/')
      const type = splitUrl[1]
      const namespace = splitUrl[2]
      const id = splitUrl[3]
      responseData.data.attributes.responses.push(checkInStorage(namespace, id, type.slice(0, -1).replace('-', '_')))
    });
  }

  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )
  res.status(201)
  res.json(responseData)
}