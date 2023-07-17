import {
  Account,
  ExploreMoviesResponse,
  favoriteMovie,
  getAccount,
  getAccountFavoriteMovies,
} from '@/lib/tmdb'
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
  })
}
