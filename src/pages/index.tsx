import React from 'react'
import {usePopularMovies} from '@/hooks/movies'
import MovieCard from '@/components/movie-card'
import {Button} from '@/components/ui/button'

const Loading = () => {
  return Array.from({length: 15}).map((_, i) => (
    <MovieCard.Skeleton key={`movie-card-skeleton-${i}`} />
  ))
}

export default function Home() {
  const {
    data: movies,
    fetchNextPage,
    isLoading,
    isFetching,
    isPreviousData,
    isError,
    isFetchingNextPage,
  } = usePopularMovies({page: 1})

  const showLoader =
    isLoading || (isFetching && isPreviousData) || isFetchingNextPage

  const handleLoadMore = React.useCallback(
    () => fetchNextPage(),
    [fetchNextPage],
  )

  return (
    <div className="flex h-full flex-col md:container md:mx-auto py-5 px-2 sm:px-8">
      <h1 className="text-2xl font-extrabold">Most popular</h1>
      {isError ? (
        <p className="text-red-700">
          An error occurred. Please refresh the page to try again.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 py-5 flex-1">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
            {showLoader && <Loading />}
          </div>
          <div className="flex justify-center pb-5">
            <Button variant="secondary" onClick={handleLoadMore}>
              Load more
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
