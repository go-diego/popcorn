import {fetcher} from './utils'

const BASE_URL = 'https://api.themoviedb.org/3'
const AUTH_HEADER = {
  Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_ACCESS_TOKEN}`,
}

export interface Movie {
  adult: boolean
  backdrop_path: string
  genre_ids: number[]
  id: number
  original_language: string
  original_title: string
  overview: string
  popularity: number
  poster_path: string
  release_date: string
  title: string
  video: boolean
  vote_average: number
  vote_count: number
}

export interface Genre {
  id: number
  name: string
}

export interface ProductionCompany {
  id: number
  logo_path: string | null
  name: string
  origin_country: string
}

export interface ProductionCountry {
  iso_3166_1: string
  name: string
}

export interface SpokenLanguage {
  english_name: string
  iso_639_1: string
  name: string
}

export interface Collection {
  id: number
  name: string
  poster_path: string
  backdrop_path: string
}

export interface MovieDetails extends Movie {
  belongs_to_collection: Collection
  budget: number
  genres: Genre[]
  homepage: string
  imdb_id: string
  production_companies: ProductionCompany[]
  production_countries: ProductionCountry[]
  revenue: number
  runtime: number
  spoken_languages: SpokenLanguage[]
  status: string
  tagline: string
}

export type ExploreMoviesResponse = {
  page: number
  results: Movie[]
  total_pages: number
  total_results: number
}

export interface ExploreMoviesParams {
  page?: number
}

/**
 * POPULAR MOVIES
 */
const POPULAR_MOVIES_BASE_URL = new URL(`${BASE_URL}/discover/movie`)
export const POPULAR_MOVIES_BASE_URL_STRING = POPULAR_MOVIES_BASE_URL.toString()
export const getPopularMovies = async ({page = 1}: ExploreMoviesParams) => {
  const url = POPULAR_MOVIES_BASE_URL
  url.searchParams.set('include_adult', 'false')
  url.searchParams.set('include_video', 'true')
  url.searchParams.set('language', 'en-US')
  url.searchParams.set('sort_by', 'popularity.desc')
  url.searchParams.set('page', page.toString())

  return fetcher<ExploreMoviesResponse>(url.toString(), {
    headers: AUTH_HEADER,
  })
}
export type PopularMoviesResponse = Awaited<ReturnType<typeof getPopularMovies>>

/**
 * SEARCH MOVIES
 */
interface SearchExploreMoviesParams extends ExploreMoviesParams {
  query: string
}
const SEARCH_MOVIES_BASE_URL = new URL(`${BASE_URL}/search/movie`)
export const SEARCH_MOVIES_BASE_URL_STRING = POPULAR_MOVIES_BASE_URL.toString()
export const searchMovies = async ({
  page = 1,
  query,
}: SearchExploreMoviesParams) => {
  const url = SEARCH_MOVIES_BASE_URL
  url.searchParams.set('include_adult', 'false')
  url.searchParams.set('language', 'en-US')
  url.searchParams.set('query', query)
  url.searchParams.set('page', page.toString())

  return fetcher<ExploreMoviesResponse>(url.toString(), {
    headers: AUTH_HEADER,
  })
}
export type SearchMoviesResponse = Awaited<ReturnType<typeof searchMovies>>

/**
 * MOVIE DETAILS
 */
const MOVIE_DETAILS_BASE_URL = new URL(`${BASE_URL}/movie`)
export const MOVIE_DETAILS_BASE_URL_STRING = MOVIE_DETAILS_BASE_URL.toString()
export const getMovieDetails = async (movieId: number) => {
  const url = new URL(`${MOVIE_DETAILS_BASE_URL}/${movieId}`)

  return fetcher<MovieDetails>(url.toString(), {
    headers: AUTH_HEADER,
  })
}
export type MovieDetailsResponse = Awaited<ReturnType<typeof getMovieDetails>>

/**
 * AUTHENTICATION
 */
const AUTH_BASE_URL = new URL(`${BASE_URL}/authentication`)

export const getRequestToken = async () => {
  const url = new URL(`${AUTH_BASE_URL}/token/new`)
  return fetcher<{request_token: string}>(url.toString(), {
    headers: AUTH_HEADER,
  })
}

export const createSession = async (requestToken: string) => {
  const url = new URL(`${AUTH_BASE_URL}/session/new`)
  url.searchParams.set('request_token', requestToken)
  return fetcher<{session_id: string}>(url.toString(), {
    method: 'GET',
    headers: AUTH_HEADER,
  })
}

/**
 * ACCOUNT
 */

export type Account = {
  id: number
}

const ACCOUNT_BASE_URL = new URL(`${BASE_URL}/account`)
export const ACCOUNT_BASE_URL_STRING = ACCOUNT_BASE_URL.toString()
export const getAccount = async (sessionId: string) => {
  const url = new URL(`${ACCOUNT_BASE_URL}`)
  url.searchParams.set('session_id', sessionId)

  return fetcher<Account>(url.toString(), {
    headers: AUTH_HEADER,
  })
}

export const getAccountFavoriteMovies = async (accountId: number) => {
  const url = new URL(`${ACCOUNT_BASE_URL}/${accountId}/favorite/movies`)

  return fetcher<ExploreMoviesResponse>(url.toString(), {
    headers: AUTH_HEADER,
  })
}

export const favoriteMovie = async ({
  accountId,
  sessionId,
  movieId,
  favorite,
}: {
  accountId: number
  sessionId: string
  movieId: number
  favorite: boolean
}) => {
  const url = new URL(
    `${ACCOUNT_BASE_URL}/${accountId}/favorite?session_id=${sessionId}`,
  )
  const body = JSON.stringify({
    media_type: 'movie',
    media_id: movieId,
    favorite,
  })
  return fetcher(url.toString(), {
    method: 'POST',
    headers: {
      ...AUTH_HEADER,
      'Content-Type': 'application/json;charset=utf-8',
    },
    body,
  })
}
