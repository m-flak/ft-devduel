/* eslint-disable no-undef */
/********************** HELPER FUNCTIONS **************************************/
const scoreTitle = title => {
    const scoring = {
        'Forker': 1,
        'One-Trick Pony': 1,
        'Jack of all Trades': 3,
        'Stalker': 1,
        'Mr. Popular': 3,
        'Barry Block': 1
    }

    if (scoring[title] === undefined) {
        return 0
    }

    return scoring[title]
}

const scoreableStats = user =>
    [user['total-stars'], user['perfect-repos'], user.followers]

/********************** FORM onSubmit EVENT HANDLER ***************************/

$('form').submit(() => {
  const refreshMain = f => $('main').hasClass('error-state') ? f() : null
  const refreshError = f => $('.duel-error').hasClass('hide') ? null : f()
  const refreshUsers = f =>
    $('.user-results').hasClass('defeat') || $('.user-results').hasClass('victory') ? f() : null

  // If there was an error state, remove it.
  refreshMain(() => $('main').removeClass('error-state'))
  refreshError(() => $('span.error + span.error').remove())
  refreshError(() => $('.duel-error').addClass('hide'))

  // Remove the old win/loss indicators
  refreshUsers(() => $('.winner').addClass('hide'))
  refreshUsers(() => $('.loser').addClass('hide'))
  refreshUsers(() => $('.win-loss').removeClass('defeat'))
  refreshUsers(() => $('.win-loss').removeClass('victory'))
  refreshUsers(() => $('.user-results').removeClass('defeat'))
  refreshUsers(() => $('.user-results').removeClass('victory'))

  // Create the URL with the query string from the username fields
  let duelURL = new URL(`${USERS_URL}`)
  $('input[name|=username]').get().forEach(u => duelURL.searchParams.append('username', u.value))

  fetch(duelURL.toString())
    .then(response => {
        // Fail on any HTTP 4xx response
        if ((response.status & 400) === 400) {
            // Use the backend's error message
            return response.text().then(t => Promise.reject(new Error(t)))
        }

        return response.json()
    })
    .then(data => {
        // Map data to CSS class names
        const userStats = dat => ({
            username: dat.username,
            'full-name': dat.name,
            location: dat.location,
            email: dat.email,
            bio: dat.bio,
            titles: dat.titles,
            'favorite-language': dat['favorite-language'],
            'public-repos': dat['public-repos'],
            'total-stars': dat['total-stars'],
            'most-starred': dat['highest-starred'],
            'perfect-repos': dat['perfect-repos'],
            followers: dat.followers,
            following: dat.following
        })

        const [leftUser, rightUser] = data

        if (leftUser.username === rightUser.username) {
            const msg = 'You can\'t duel yourself.'
            return Promise.reject(new Error(msg))
        }

        const leftStats = userStats(leftUser)
        const rightStats = userStats(rightUser)

        // Assign data to the DOM elements but don't display any 'null' fields
        Object.keys(leftStats).forEach(k => $('.left').find(`.${k}`).text(leftStats[k]))
        $('.left').find('.avatar').attr('src', leftUser['avatar-url'])
        $('.left').find('span').filter((i, e) => e.innerText === 'null').text('')

        Object.keys(rightStats).forEach(k => $('.right').find(`.${k}`).text(rightStats[k]))
        $('.right').find('.avatar').attr('src', rightUser['avatar-url'])
        $('.right').find('span').filter((i, e) => e.innerText === 'null').text('')

        /* Scoring will done by titles, total stars, perfect repos, and ...
         *    followers.
         */

         // leftUser's total score
         let leftScore = 0
         leftScore += leftUser.titles.reduce((acc, val) => acc + scoreTitle(val), 0)
         leftScore += scoreableStats(leftUser).reduce((acc, val) => acc + val)

         // rightUser's total score
         let rightScore = 0
         rightScore += rightUser.titles.reduce((acc, val) => acc + scoreTitle(val), 0)
         rightScore += scoreableStats(rightUser).reduce((acc, val) => acc + val)

         // Find where to say winner
         let victorCSS = ''
         if (rightScore > leftScore) {
             victorCSS = 'RightVictor'
         }
         else if (leftScore > rightScore) {
             victorCSS = 'LeftVictor'
         }

         let loser = $('.win-loss').filter((i, e) => e.id !== victorCSS)
         let winner = $(`#${victorCSS}`)

         // Visually show Winner
         loser.addClass('defeat')
         loser.find('.loser').removeClass('hide')
         $(`.${loser.data('user')}`).addClass('defeat')

         // Visually show Loser
         winner.addClass('victory')
         winner.find('.winner').removeClass('hide')
         $(`.${winner.data('user')}`).addClass('victory')

         $('.duel-container').removeClass('hide')
    })
    .catch(err => {
        const errMsg = (msg) => {
            let element = document.createElement('span')
            $(element).addClass('error')
            $(element).text(msg)
            return element
        }

        $('.duel-container').addClass('hide')
        $('main').addClass('error-state')
        $('.duel-error').removeClass('hide')
        $('.duel-error').append(errMsg(err.message))
    })

  return false
})
