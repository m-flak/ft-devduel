import 'axios' from axios
import token from '../../token'

/* * * * * * * * * * * * PRIVATE METHODS * * * * * * * * * * * * * * * * * * */
const getLanguages = repositories => respositories.map(r => r.language)

const getFavoriteLanguage = repositories => {
    const languages = getLanguages(repositories)
    const occurrences = languages.map(lang => languages.filter(lingo => lingo === lang).length)
    const index = occurrences.findIndex(i => i === Math.max(...occurrences))

    return languages[index]
}

const getTotalStars = repositories =>
    repositories.reduce((acc, repo) => acc + repo.stargazers_count, 0)

const getHighestStarred = repositories =>
    Math.max(...repositories.map(r => r.stargazers_count))

const getPerfectRepos = repositories =>
    repositories.filter(r => r.open_issues_count === 0).length

/* * * * * * * * * * * * PUBLIC METHODS * * * * * * * * * * * * * * * * * * * */
export const githubUserProfile = () => ({
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

export const getUserProfile = username =>
    axios.get(`https://api.github.com/users/${username}`, {
        headers: {
            'Authorization': token
        }
    })
    .then(response => JSON.parse(response.data))
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

export const getUserRepositories = username =>
    axios.get(`https://api.github.com/users/${username}/repos`, {
        headers: {
            'Authorization': token
        }
    })
    .then(response => JSON.parse(response.data))

export const getUserRepositoryStats = repositories => ({
    'favorite-language': getFavoriteLanguage(repositories),
    'total-stars': getTotalStars(repositories),
    'highest-starred': getHighestStarred(repositories),
    'perfect-repos': getPerfectRepos(repositories)
})
