import {
  Account,
  ExploreMoviesResponse,
  favoriteMovie,
  getAccount,
  getAccountFavoriteMovies,
} from '@/lib/tmdb'
import {queryClient} from '@/lib/utils'
import {useMutation, useQuery, UseQueryOptions} from '@tanstack/react-query'

export function useAccount(
  sessionId?: string,
  options?: UseQueryOptions<Account, Error>,
) {
  return useQuery<Account, Error>(
    ['account', sessionId],
    async () => getAccount(sessionId || ''),
    options,
  )
}

export function useAccountFavoriteMovies(
  accountId?: number,
  options?: UseQueryOptions<ExploreMoviesResponse, Error>,
) {
  return useQuery<ExploreMoviesResponse, Error>(
    ['account/favorite-movies', accountId],
    async () => getAccountFavoriteMovies(accountId || 0),
    options,
  )
}

export const useFavoriteMovie = () => {
  return useMutation({
    mutationFn: favoriteMovie,
    onSuccess: (_, {accountId}) => {
      /**
       * Just invalidate the query to get the latest list of favorite movies
       * so that the UI can update accordingly.
       *
       * Alternatively, we can update the query cache and optimistically update
       * the UI
       */
      queryClient.invalidateQueries(['account/favorite-movies', accountId])
    },
  })
}
