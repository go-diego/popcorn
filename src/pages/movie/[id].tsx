import {useState, useMemo, useCallback, useEffect} from 'react'
import {GetServerSideProps} from 'next'
import {
  ExploreMoviesResponse,
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
import {queryClient} from '@/lib/utils'

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
    adult,
    backdrop_path,
    genre_ids,
    original_language,
    original_title,
    popularity,
    video,
    vote_average,
    vote_count,
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
    if (!sessionId || !account?.id) {
      const {request_token} = await getRequestToken()
      window.open(
        `https://www.themoviedb.org/authenticate/${request_token}?redirect_to=${window.location.href}`,
      )
    } else {
      favoriteMovie(
        {
          sessionId,
          accountId: account?.id,
          movieId: id,
          favorite: !isFavorited,
        },
        {
          onSuccess: () => {
            /**
             * optimistically update UI by updating the query data for favorited
             * movies.
             *
             */
            const key = ['account/favorite-movies', account?.id]
            const data = queryClient.getQueryData<ExploreMoviesResponse>(key)

            /**
             * If is already favorited, remove it from list,
             * otherwise add it to the list.
             *
             * When adding we need to add all the right properties
             * to the movie object.
             */
            const updatedFavorites = isFavorited
              ? data?.results.filter((m) => m.id !== id)
              : [
                  ...(data?.results || []),
                  {
                    id,
                    title,
                    poster_path,
                    release_date,
                    adult,
                    backdrop_path,
                    genre_ids,
                    original_language,
                    original_title,
                    popularity,
                    video,
                    vote_average,
                    vote_count,
                    overview,
                  },
                ]

            if (data) {
              data.results = updatedFavorites || []
            }

            queryClient.setQueryData(key, data)
          },
        },
      )
    }
  }, [
    sessionId,
    account?.id,
    id,
    favoriteMovie,
    isFavorited,
    title,
    poster_path,
    release_date,
    adult,
    backdrop_path,
    genre_ids,
    original_language,
    original_title,
    popularity,
    video,
    vote_average,
    vote_count,
    overview,
  ])

  const showFavoriteButton = useMemo(
    () =>
      (!!sessionId && !isLoadingAccount) ||
      true ||
      (!!account?.id && !isLoadingFavoritedMovies) ||
      true,
    [isLoadingAccount, isLoadingFavoritedMovies, sessionId, account?.id],
  )

  return (
    <div className="flex h-full flex-col md:container md:mx-auto py-5 px-2 sm:px-8">
      <div className="flex gap-4">
        <img
          src={`https://image.tmdb.org/t/p/original/${poster_path}`}
          alt={title}
          className="max-h-[300px] object-cover rounded"
        />
        <div className="flex-1">
          <div className="flex justify-between">
            <h1 className="text-4xl mb-1">{title}</h1>
            {showFavoriteButton && (
              <Button
                size="sm"
                variant={isFavorited ? 'outline' : 'secondary'}
                onClick={handleFavorite}
                className="rounded"
              >
                {isFavorited ? 'Unfavorite 💔' : 'Favorite ❤️'}
              </Button>
            )}
          </div>
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
  const id = params?.id as string | undefined

  if (!id)
    return {
      notFound: true,
    }

  let movieDetails = null
  try {
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
