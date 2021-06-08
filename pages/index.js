import { gql, useMutation, useQuery } from '@apollo/client'
import React from 'react'

const GistFragment = gql`
  fragment GistFragment on Gist {
    id
    description
    created_at
    files {
      filename
      content
    }
    meta {
      isFavorite
    }
  }
`

const GetPublicGistsForUserQuery = gql`
  query GetPublicGistsForUser($username: String!) {
    getPublicGistsForUser(username: $username) {
      nodes {
        ...GistFragment
      }
      pageInfo {
        hasNextPage
      }
    }
  }

  ${GistFragment}
`

const GetGistByIdQuery = gql`
  query GetGistById($gistId: String!) {
    getGistById(gistId: $gistId) {
      ...GistFragment
    }
  }

  ${GistFragment}
`

function usePageState() {
  const [state, dispatch] = React.useReducer(
    (state, action) => {
      switch (action.type) {
        case 'SET_USERNAME':
          return { ...state, username: action.payload }
        case 'VIEW_GIST':
          return { ...state, mode: 'view', gistId: action.payload }
        case 'RETURN_TO_SEARCH':
          return { ...state, mode: 'search', gistId: null }
        default:
          return state
      }
    },
    { mode: 'search', username: '', gistId: null }
  )
  const handlers = React.useMemo(
    () => ({
      setUsername(username) {
        dispatch({ type: 'SET_USERNAME', payload: username })
      },
      viewGist(gistId) {
        dispatch({ type: 'VIEW_GIST', payload: gistId })
      },
      returnToSearch() {
        dispatch({ type: 'RETURN_TO_SEARCH' })
      },
    }),
    []
  )
  const debouncedUsername = useDebounce(state.username, 500)
  return [{ ...state, debouncedUsername }, handlers]
}

export default function IndexPage() {
  const [
    { mode, username, debouncedUsername, gistId },
    { setUsername, viewGist, returnToSearch },
  ] = usePageState()

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <header
        style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
      >
        {mode === 'view' ? (
          <button onClick={returnToSearch} style={{ marginRight: '1em' }}>
            ←
          </button>
        ) : null}
        <h1 style={{ marginRight: 'auto' }}>Gist Viewer</h1>
      </header>
      {mode === 'search' ? (
        <>
          <div style={{ display: 'inline-flex', flexDirection: 'column' }}>
            <label htmlFor='username'>GitHub Username</label>
            <input
              id='username'
              name='username'
              type='text'
              placeholder='Username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <SearchResults
            username={debouncedUsername}
            onGistClick={(gistId) => viewGist(gistId)}
          />
        </>
      ) : null}
      {mode === 'view' ? <GistDetailView gistId={gistId} /> : null}
    </div>
  )
}

function SearchResults({ username, onGistClick }) {
  const gists = useQuery(GetPublicGistsForUserQuery, {
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
          <li
            key={node.id}
            onClick={() => onGistClick(node.id)}
            style={{ cursor: 'pointer' }}
          >
            <GistSummary {...node} />
          </li>
        ))}
      </ul>
      {/* TODO support pagination */}
    </div>
  )
}

function GistSummary({ description, created_at, meta: { isFavorite } }) {
  const formattedTime = new Intl.DateTimeFormat('en').format(
    Date.parse(created_at)
  )
  return (
    <div>
      <span>{isFavorite ? '⭐️' : null}</span>
      <span style={{ fontSize: '0.8em' }}>
        <time dateTime={created_at}>[{formattedTime}]</time>
      </span>{' '}
      {description || '[No Description]'}
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

const FavoriteGistMutation = gql`
  mutation FavoriteGist($gistId: String!) {
    favoriteGist(gistId: $gistId) {
      ...GistFragment
    }
  }

  ${GistFragment}
`

const UnfavoriteGistMutation = gql`
  mutation UnfavoriteGist($gistId: String!) {
    unfavoriteGist(gistId: $gistId) {
      ...GistFragment
    }
  }

  ${GistFragment}
`

function GistDetailView({ gistId }) {
  const gist = useQuery(GetGistByIdQuery, { variables: { gistId } })
  const [favoriteGist] = useMutation(FavoriteGistMutation)
  const [unfavoriteGist] = useMutation(UnfavoriteGistMutation)

  if (gist.loading) {
    return <div>Loading...</div>
  }
  if (gist.error) {
    return <div>Unable to load gist {gistId}.</div>
  }
  if (!gist) {
    return <div>Gist {gistId} not found.</div>
  }

  const { files, description, meta } = gist.data.getGistById

  return (
    <div>
      <div>
        <h2>Gist {gistId}</h2>
        <h3>{description}</h3>
        {meta.isFavorite ? (
          <button onClick={() => unfavoriteGist({ variables: { gistId } })}>
            Remove from Favorites
          </button>
        ) : (
          <button onClick={() => favoriteGist({ variables: { gistId } })}>
            Mark as Favorite
          </button>
        )}
      </div>
      {files.map((file) => (
        <div key={file.filename}>
          <h4>{file.filename}</h4>
          <pre>{file.content}</pre>
        </div>
      ))}
    </div>
  )
}
