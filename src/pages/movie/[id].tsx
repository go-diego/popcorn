import {useState, useMemo, useCallback, useEffect} from 'react'
import {GetServerSideProps} from 'next'
import {
  MovieDetails,
  createSession,
  getMovieDetails,
  getRequestToken,
} from '@/lib/tmdb'
import {format} from 'date-fns'
import {Button} from '@/components/ui/button'
import {
  useAccount,
  useAccountFavoriteMovies,
  useFavoriteMovie,
} from '@/hooks/account'
import {useRouter} from 'next/router'

function MovieDetailsPage({
  details: {
    title,
    poster_path,
    overview,
    release_date,
    genres,
    tagline,
    runtime,
    id,
  },
}: {
  details: MovieDetails
}) {
  const {mutate: favoriteMovie} = useFavoriteMovie()
  const router = useRouter()
  const [sessionId, setSessionId] = useState<string>()

  useEffect(() => {
    const sessionId = localStorage.getItem('session_id')
    if (sessionId) {
      setSessionId(sessionId)
    }
  }, [])

  /**
   * Don't like this but it was the easiest way to authenticate a user.
   * Ideally would want to setup a /authorize page that does this
   * and ideally wouldn't want to store the token in local storage.
   */
  useEffect(() => {
    const token = router.query.request_token as string
    if (token && !sessionId) {
      createSession(token)
        .then(({session_id}) => {
          localStorage.setItem('session_id', session_id)
          setSessionId(session_id)
        })
        .catch((err) => {
          console.log(err)
        })
        .finally(() => {
          /**
           * Replace the current route with the same route but without the request_token query param.
           */
          router.replace(`/movie/${id}`, undefined, {shallow: true})
        })
    }
  }, [router.query.request_token, id, sessionId, router])

  const {data: account, isLoading: isLoadingAccount} = useAccount(sessionId, {
    enabled: !!sessionId,
  })

  const {
    data: {results: favoritedMovies = []} = {},
    isLoading: isLoadingFavoritedMovies,
  } = useAccountFavoriteMovies(account?.id, {
    enabled: !!account?.id,
  })

  const isFavorited = useMemo(
    () => favoritedMovies.some((m) => m.id === id),
    [favoritedMovies, id],
  )

  const handleFavorite = useCallback(async () => {
    /**
     * Just doing this for now but would be ideal to have some kind of Auth gate that
     * gates components if user isn't authenticated.
     */
    if (!sessionId || !account?.id) {
      const {request_token} = await getRequestToken()
      window.open(
        `https://www.themoviedb.org/authenticate/${request_token}?redirect_to=${window.location.href}`,
      )
    } else {
      favoriteMovie({
        sessionId,
        accountId: account?.id,
        movieId: id,
        favorite: !isFavorited,
      })
    }
  }, [sessionId, account?.id, id, favoriteMovie, isFavorited])

  /**
   * Don't show the button if either of the account or favorited movies queries are
   * enabled AND loading. This is to prevent the button from flashing from unfavorited to favorited
   * while the query settles.
   */
  const showFavoriteButton = useMemo(
    () =>
      (!!sessionId ? !isLoadingAccount : true) &&
      (!!account?.id ? !isLoadingFavoritedMovies : true),

    [isLoadingAccount, isLoadingFavoritedMovies, sessionId, account?.id],
  )

  return (
    <div className="flex h-full flex-col md:container md:mx-auto py-5 px-2 sm:px-8">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col gap-2">
          <img
            src={`https://image.tmdb.org/t/p/original/${poster_path}`}
            alt={title}
            className="max-h-[300px] object-cover rounded"
          />
          {showFavoriteButton && (
            <div className="flex justify-center">
              <Button
                size="sm"
                variant={isFavorited ? 'secondary' : 'outline'}
                onClick={handleFavorite}
                className="rounded sm:w-full"
              >
                {isFavorited ? 'Unfavorite 💔' : 'Favorite ❤️'}
              </Button>
            </div>
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-4xl mb-1">{title}</h1>
          {release_date && (
            <p className="text-xs text-slate-500">
              {`Released ${format(new Date(release_date), 'MMMM d, yyyy')}`}
            </p>
          )}
          <p className="text-xs text-slate-500 mb-4">{`${runtime} minutes`}</p>
          {tagline && <p className="text-xl mb-4 font-semibold">{tagline}</p>}
          <p className="mb-2">{overview}</p>
          <div className="flex gap-2 flex-wrap">
            {genres.map((g) => (
              <span
                key={g.id}
                className="bg-slate-600 text-white text-xs px-2 py-1 rounded"
              >
                {g.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({params}) => {
  /**
   * Load movie details server-side. Redirect to 404 if not found.
   * We save ourselves from managing loading state and not found state in the client.
   * And if this was a real app, we'd want to do this anyway for SEO (would have to add the tags at the page level still)
   */
  const id = params?.id as string | undefined

  if (!id)
    return {
      notFound: true,
    }

  let movieDetails = null
  try {
    /**
     * Could have gotten crazy here and used react-query's `queryClient.prefetchQuery` too
     */
    movieDetails = await getMovieDetails(parseInt(id, 10))
  } catch (error) {
    console.error(error)
  }

  if (!movieDetails) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      details: movieDetails,
    },
  }
}

export default MovieDetailsPage
