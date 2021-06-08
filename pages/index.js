import React from 'react'
import { useQuery, gql } from '@apollo/client'

const GistQuery = gql`
  query GetPublicGistsForUser($username: String!) {
    getPublicGistsForUser(username: $username) {
      nodes {
        id
        description
        created_at
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`

export default function Index() {
  const [username, setUsername] = React.useState('')
  const debouncedUsername = useDebounce(username, 500)
  return (
    <div>
      <input
        name='username'
        type='text'
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <SearchView username={debouncedUsername} />
    </div>
  )
}

const SearchView = React.memo(({ username }) => {
  const gists = useQuery(GistQuery, {
    variables: { username },
    skip: !username,
  })

  if (gists.loading) {
    return <div>Loading...</div>
  }
  if (gists.error) {
    return <div>Unable to load gists for {username}.</div>
  }
  return (
    <div>
      <ul>
        {gists.data?.getPublicGistsForUser?.nodes.map((node) => (
          <li key={node.id}>
            <GistSummary {...node} />
          </li>
        ))}
      </ul>
      {/* TODO support pagination */}
    </div>
  )
})

function GistSummary({ description, created_at }) {
  return (
    <div>
      <div>{description || '[No Description]'}</div>
      <time dateTime={created_at}>
        {new Intl.DateTimeFormat('en').format(Date.parse(created_at))}
      </time>
    </div>
  )
}

function useDebounce(value, delayMs) {
  const [debouncedValue, setDebouncedValue] = React.useState(value)
  React.useEffect(() => {
    const debounceHandler = setTimeout(() => setDebouncedValue(value), delayMs)
    return () => clearTimeout(debounceHandler)
  }, [value, delayMs])
  return debouncedValue
}
