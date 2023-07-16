import {useInfiniteQuery, UseInfiniteQueryOptions} from '@tanstack/react-query'
import {
  ExploreMoviesParams,
  getPopularMovies,
  PopularMoviesResponse,
} from '@/lib/tmdb'

export const usePopularMovies = (
  params: ExploreMoviesParams,
  options?: UseInfiniteQueryOptions<PopularMoviesResponse, Error>,
) => {
  const {data: infiniteQueryData, ...rest} = useInfiniteQuery<
    PopularMoviesResponse,
    Error
  >(
    ['popular-movies', params],
    async ({pageParam = 1}) => {
      return getPopularMovies({...params, page: pageParam})
    },
    {
      getNextPageParam: (_, allPages) => allPages.length + 1,
      keepPreviousData: true,
      ...options,
    },
  )

  const data = infiniteQueryData?.pages.flatMap((p) => p.results) || []

  return {
    ...rest,
    data,
  }
}
