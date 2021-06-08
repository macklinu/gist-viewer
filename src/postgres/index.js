import { Pool } from 'pg'

const pool = new Pool({
  // TODO convert all to environment variables
  user: 'postgres',
  password: 'postgres',
  database: 'gist_viewer',
  host: 'postgres',
})

export async function getFavoriteGists({ offset = 0, limit = 50 }) {
  const { rows } = await pool.query(
    'SELECT gist_id FROM favorite_gists LIMIT $1 OFFSET $2',
    [limit, offset]
  )
  return rows.map((row) => row.gist_id)
}

export async function findFavoritesByGistIds(gistIds) {
  const placeholders = gistIds.map((_, index) => `$${index + 1}`).join(',')
  const { rows } = await pool.query(
    `SELECT gist_id FROM favorite_gists WHERE gist_id in (${placeholders})`,
    [...gistIds]
  )
  return new Set(rows.map((row) => row.gist_id))
}

export async function markFavoriteGist(gistId) {
  await pool.query('INSERT INTO favorite_gists (gist_id) VALUES ($1)', [gistId])
}

export async function removeFavoriteGist(gistId) {
  await pool.query('DELETE FROM favorite_gists WHERE gist_id = $1', [gistId])
}
