import axios from 'axios'
import token from '../../token'
import APIError from './APIError'

/* * * * * * * * * * * * PRIVATE METHODS * * * * * * * * * * * * * * * * * * */
const getLanguages = repositories => repositories.map(r => r.language)

const getFavoriteLanguage = repositories => {
    const languages = getLanguages(repositories)
    // Ex: [JS, JS, Python] -> [2, 2, 1] - this allows for use of max to find fave
    const occurrences = languages.map(lang => languages.filter(lingo => lingo === lang).length)
    const index = occurrences.findIndex(i => i === Math.max(...occurrences))

    // Ex: [JS, JS, Python] -> [2, 2, 1]
    // Therefore, index of max is also index of favorite language
    return languages[index]
}

const getTotalStars = repositories =>
    repositories.reduce((acc, repo) => acc + repo.stargazers_count, 0)

const getHighestStarred = repositories =>
    Math.max(...repositories.map(r => r.stargazers_count))

const getPerfectRepos = repositories =>
    repositories.filter(r => r.open_issues_count === 0).length

// TITLES!!!
const isForker = repositories =>
    repositories.filter(r => r.fork).length >= repositories.length / 2 ? 'Forker' : ''

const isOneTrickPony = repositories => {
    const languages = getLanguages(repositories)

    // Are all languages the same???
    if (languages.reduce((acc, cval) => acc === cval ? cval : null, languages[0])) {
        return 'One-Trick Pony'
    }

    return ''
}

const isJackOfAllTrades = repositories => {
    let differentLanguages = []

    for (const lang of getLanguages(repositories)) {
        if (differentLanguages.findIndex(l => l === lang) === -1) {
            differentLanguages.push(lang)
        }
    }

    return differentLanguages.length > 10 ? 'Jack of all Trades' : ''
}

const isStalker = profile =>
    profile.following >= profile.followers * 2 ? 'Stalker' : ''

const isMrPopular = profile =>
    profile.followers >= profile.following * 2 ? 'Mr. Popular' : ''

const isBarryBlock = repositories =>
    repositories.filter(r => r.watchers_count > 1).length >= 1 ? 'Barry Block' : ''

const userProfileBase = () => ({
    username: '',
    name: '',
    location: '',
    bio: '',
    'avatar-url': '',
    titles: [],
    'favorite-language': '',
    'public-repos': 0,
    'total-stars': 0,
    'highest-starred': 0,
    'perfect-repos': 0,
    followers: 0,
    following: 0
})

const getUserProfile = username =>
    axios.get(`https://api.github.com/users/${username}`, {
        headers: {
            'Authorization': token
        }
    })
    .then(response => response.data)
    .then(jsonProfile => ({
        username: jsonProfile.login,
        name: jsonProfile.name,
        location: jsonProfile.location,
        bio: jsonProfile.bio,
        'avatar-url': jsonProfile.avatar_url,
        'public-repos': jsonProfile.public_repos,
        followers: jsonProfile.followers,
        following: jsonProfile.following
    }))
    .catch(err => {
        throw new APIError('Unable to retrieve username', err.response.status)
    })

const getUserRepositories = username =>
    axios.get(`https://api.github.com/users/${username}/repos`, {
        headers: {
            'Authorization': token
        }
    })
    .then(response => response.data)
    .catch(err => {
        throw new APIError('Unable to retrieve repositories', err.response.status)
    })

const getUserRepositoryStats = repositories => ({
    'favorite-language': getFavoriteLanguage(repositories),
    'total-stars': getTotalStars(repositories),
    'highest-starred': getHighestStarred(repositories),
    'perfect-repos': getPerfectRepos(repositories)
})

const getUserTitles = (profile, repos) => [
        isForker(repos),
        isOneTrickPony(repos),
        isJackOfAllTrades(repos),
        isStalker(profile),
        isMrPopular(profile),
        isBarryBlock(repos)
    ]
    .filter(t => t)

const makeProfile = repo => username => {
    return Promise.all([getUserProfile(username), repo(username)])
        .then(results => {
            const [profile, repos] = results

            return {
                ...userProfileBase(),
                ...profile,
                titles: getUserTitles(profile, repos),
                ...getUserRepositoryStats(repos)
            }
        })
}

/* * * * * * * * * * * * PUBLIC METHODS * * * * * * * * * * * * * * * * * * * */
// getGitHubProfile(username) -> a Promise containing a Profile for the frontend
export const getGitHubProfile = makeProfile(getUserRepositories)
