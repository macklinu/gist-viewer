import { gql, useQuery } from '@apollo/client'
import React from 'react'

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

const GetGistByIdQuery = gql`
  query GetGistById($gistId: String!) {
    getGistById(gistId: $gistId) {
      id
      description
      created_at
      files {
        filename
        content
      }
    }
  }
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
          <SearchView
            username={debouncedUsername}
            onGistClick={(gistId) => viewGist(gistId)}
          />
        </>
      ) : null}
      {mode === 'view' ? <GistDetailView gistId={gistId} /> : null}
    </div>
  )
}

const SearchView = React.memo(({ username, onGistClick }) => {
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
})

function GistSummary({ description, created_at }) {
  const formattedTime = new Intl.DateTimeFormat('en').format(
    Date.parse(created_at)
  )
  return (
    <div>
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

function GistDetailView({ gistId }) {
  const gist = useQuery(GetGistByIdQuery, { variables: { gistId } })
  if (gist.loading) {
    return <div>Loading...</div>
  }
  if (gist.error) {
    return <div>Unable to load gist {gistId}.</div>
  }
  if (!gist) {
    return <div>Gist {gistId} not found.</div>
  }

  return (
    <div>
      <div>
        <h2>Gist {gistId}</h2>
        <h3>{gist.data.getGistById.description}</h3>
      </div>
      {gist.data.getGistById.files.map((file) => (
        <div key={file.filename}>
          <h4>{file.filename}</h4>
          <pre>{file.content}</pre>
        </div>
      ))}
    </div>
  )
}
