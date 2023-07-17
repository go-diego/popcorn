import {
  ComponentProps,
  useMemo,
  useCallback,
  useState,
  ChangeEvent,
} from 'react'
import debounce from 'lodash.debounce'
import {Dialog, DialogContent} from '@/components/ui/dialog'
import {Input} from '@/components/ui/input'
import {Movie, searchMovies} from '@/lib/tmdb'
import {MovieSearchResultItem} from './movie-search-result-item'

const Loading = () => (
  <div className="flex flex-col items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900" />
    <p className="text-gray-600 text-xl font-semibold mt-4">Loading...</p>
  </div>
)

export function SearchDialog({
  open,
  onOpenChange,
}: Required<Pick<ComponentProps<typeof Dialog>, 'open' | 'onOpenChange'>>) {
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Movie[]>([])
  const [searchString, setSearchString] = useState('')
  const [error, setError] = useState<boolean>(false)

  const debouncedSearch = useMemo(
    () =>
      debounce((event: ChangeEvent<HTMLInputElement>) => {
        const searchString = event.target.value
        if (searchString.length === 0) {
          setSearchResults([])
        }
        if (searchString.length > 2) {
          setIsSearching(true)
          searchMovies({query: searchString})
            .then((response) => {
              setSearchResults(response.results)
            })
            .catch(() => {
              setError(true)
            })
            .finally(() => {
              setIsSearching(false)
            })
        }
      }, 300),
    [],
  )

  const handleSearch = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setSearchString(event.target.value)
      debouncedSearch(event)
    },
    [debouncedSearch],
  )

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        setSearchString('')
        setSearchResults([])
        setError(false)
      }
      onOpenChange(open)
    },
    [onOpenChange],
  )

  const handleMovieClick = useCallback(() => {
    setSearchString('')
    setSearchResults([])
    setError(false)
    onOpenChange(false)
  }, [onOpenChange])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="px-0 pt-10 sm:max-w-[425px] h-screen sm:h-[500px] lg:h-[500px] flex flex-col">
        <div className="pt-4 px-1 flex w-full items-center">
          <Input
            className="w-full"
            onChange={handleSearch}
            placeholder="Search for a movie by title...👀"
          />
        </div>
        <div className="flex flex-col items-center justify-center overflow-y-auto flex-1">
          {error ? (
            <p data-testid="search-movies-error" className="text-red-700">
              An error occurred. Please try again.
            </p>
          ) : (
            <>
              {isSearching && <Loading />}
              {!isSearching &&
                searchResults.length === 0 &&
                searchString.length > 0 && (
                  <div className="flex flex-col items-center justify-center h-screen sm:h-[3000px] lg:h-[500px]">
                    <p
                      data-testid="no-search-results"
                      className="text-gray-600 text-xl font-semibold"
                    >
                      No results found
                    </p>
                  </div>
                )}
              {!isSearching && searchResults.length > 0 && (
                <ul
                  data-testid="search-results-list"
                  className="w-full px-1 h-full"
                >
                  {searchResults.map((movie) => (
                    <MovieSearchResultItem
                      onMovieSelect={handleMovieClick}
                      key={movie.id}
                      movie={movie}
                    />
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
