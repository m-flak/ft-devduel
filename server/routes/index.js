import { Router } from 'express'
import axios from 'axios'
import validate from 'express-validation'
import token from '../../token'

import validation from './validation'

import { getGitHubProfile } from '../lib/github'

export default () => {
  let router = Router()

  /** GET /health-check - Check service health */
  router.get('/health-check', (req, res) => res.send('OK'))

  // The following is an example request.response using axios and the
  // express res.json() function
  /** GET /api/rate_limit - Get github rate limit for your token */
  router.get('/rate', (req, res) => {
    axios.get(`http://api.github.com/rate_limit`, {
      headers: {
        'Authorization': token
      }
    }).then(({ data }) => res.json(data))
  })

  /** GET /api/user/:username - Get user */
  router.get('/user/:username', validate(validation.user), (req, res) => {
    const username = req.params.username

    getGitHubProfile(username)
      .then(profile => res.json(profile))
      .catch(err => res.status(err.status).send(`${err.message}: ${username}`))
  })

  /** GET /api/users? - Get users */
  router.get('/users/', validate(validation.users), (req, res) => {
      const usernames = req.query.username

      Promise.all(usernames.map(u => getGitHubProfile(u)))
        .then(profiles => res.json(profiles))
        .catch(err => res.status(err.status).send(`${err.message}: ${usernames}`))
  })

  return router
}
