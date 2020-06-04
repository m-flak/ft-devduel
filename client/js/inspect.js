/* eslint-disable no-undef */
$('form').submit(() => {
  const refreshMain = f => $('main').hasClass('error-state') ? f() : null
  const refreshError = f => $('.user-error').hasClass('hide') ? null : f()

  // If there was an error state, remove it.
  refreshMain(() => $('main').removeClass('error-state'))
  refreshError(() => $('span.error + span.error').remove())
  refreshError(() => $('.user-error').addClass('hide'))

  const username = $('form input').val()

  // Fetch data for given user
  // (https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
  fetch(`${USER_URL}/${username}`)
    .then(response => {
        // Fail on any HTTP 4xx response
        if ((response.status & 400) === 400) {
            // Use the backend's error message
            return response.text().then(t => Promise.reject(new Error(t)))
        }

        return response.json()
    }) // Returns parsed json data from response body as promise
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
      const stats = userStats(data)

      // Assign data to the DOM elements
      Object.keys(stats).forEach(k => $(`.${k}`).text(stats[k]))
      $('.avatar').attr('src', data['avatar-url'])

      $('.user-results').removeClass('hide') // Display '.user-results' element
    })
    .catch(err => {
      const errMsg = (msg) => {
          let element = document.createElement("span")
          $(element).addClass('error')
          $(element).text(msg)
          return element
      }

      $('.user-results').addClass('hide')
      $('main').addClass('error-state')
      $('.user-error').removeClass('hide')
      $('.user-error').append(errMsg(err.message))
    })

  return false // return false to prevent default form submission
})
