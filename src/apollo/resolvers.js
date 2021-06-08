import * as github from 'src/github'
import * as postgres from 'src/postgres'
import parseLinkHeader from 'parse-link-header'

export const resolvers = {
  Query: {
    async getPublicGistsForUser(_parent, { username, perPage = 50, page }) {
      const { data, headers } = await github.getPublicGistsForUser(username, {
        per_page: perPage,
        page,
      })
      const gistIds = data.map((gist) => gist.id)
      const favorites = await postgres.findFavoritesByGistIds(gistIds)
      return {
        nodes: data.map((gist) => ({
          ...convertGistForSchema(gist),
          meta: {
            isFavorite: favorites.has(gist.id),
          },
        })),
        pageInfo: pageInfoFromLinkHeader(headers.link),
      }
    },
    async getGistById(_parent, { gistId }) {
      return getGistById(gistId)
    },
    async getFavoriteGists(_parent, { offset = 0, limit = 50 }) {
      const gistIds = await postgres.getFavoriteGists({
        offset,
        limit: Math.max(limit, 50),
      })
      try {
        const [favorites, ...gistResponses] = await Promise.all([
          postgres.findFavoritesByGistIds(gistIds),
          ...gistIds.map(async (gistId) => github.getGistById(gistId)),
        ])
        return gistResponses.map(({ data }) => ({
          ...convertGistForSchema(data),
          meta: {
            isFavorite: favorites.has(data.id),
          },
        }))
      } catch (error) {
        console.error(error)
        return []
      }
    },
  },
  Mutation: {
    async favoriteGist(_parent, { gistId }) {
      await postgres.markFavoriteGist(gistId)
      return getGistById(gistId)
    },
    async unfavoriteGist(_parent, { gistId }) {
      await postgres.removeFavoriteGist(gistId)
      return getGistById(gistId)
    },
  },
}

async function getGistById(gistId) {
  try {
    const [response, favorites] = await Promise.all([
      github.getGistById(gistId),
      postgres.findFavoritesByGistIds([gistId]),
    ])
    return {
      ...convertGistForSchema(response.data),
      meta: {
        isFavorite: favorites.has(gistId),
      },
    }
  } catch (error) {
    console.error(error)
    return null
  }
}

function pageInfoFromLinkHeader(header) {
  const link = parseLinkHeader(header)
  return {
    hasNextPage: typeof link?.next !== 'undefined',
  }
}

function convertGistForSchema(gist) {
  return {
    ...gist,
    files: Object.values(gist.files),
  }
}
