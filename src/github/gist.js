import axios from 'axios'

const api = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    accept: 'application/vnd.github.v3+json',
  },
})

/**
 * Gets the public gists for a user by their username.
 *
 * https://docs.github.com/en/rest/reference/gists#list-gists-for-a-user
 *
 * @param {string} username
 * @param {object} [params]
 * @param {string} [params.since]
 * @param {number} [params.per_page]
 * @param {number} [params.page]
 */
export async function getPublicGistsForUser(username, params = {}) {
  const response = await api.get(`/users/${username}/gists`, { params })
  return response
}

/**
 * Gets a gist by gist ID.
 *
 * https://docs.github.com/en/rest/reference/gists#get-a-gist
 *
 * @param {string} gistId
 */
export async function getGistById(gistId) {
  const response = await api.get(`/gists/${gistId}`)
  return response
}
