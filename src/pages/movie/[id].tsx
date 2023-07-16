import React from 'react'
import {GetServerSideProps} from 'next'
import {MovieDetails, getMovieDetails} from '@/lib/tmdb'
import {format} from 'date-fns'

function MovieDetailsPage({
  details: {
    title,
    poster_path,
    overview,
    release_date,
    genres,
    tagline,
    runtime,
  },
}: {
  details: MovieDetails
}) {
  return (
    <div className="flex h-full flex-col md:container md:mx-auto py-5 px-2 sm:px-8">
      <div className="lg:flex p-4">
        <img
          src={`https://image.tmdb.org/t/p/original/${poster_path}`}
          alt={title}
          className="max-h-[300px] object-cover rounded"
        />
        <div className="lg:w-1/2 lg:pl-8 ">
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

          {/* <p className="mb-2">
            <strong>Vote Average:</strong> {vote_average}
          </p>
          <p className="mb-2">
            <strong>Vote Count:</strong> {vote_count}
          </p>
          <p className="mb-2">
            <strong>Status:</strong> {status}
          </p>
          <p className="mb-2">
            <strong>Genres:</strong>{' '}
            {genres.map((g) => g.name).join(', ')}
          </p>
          <p className="mb-2">
            <strong>Production Companies:</strong>{' '}
            {production_companies.map((pc) => pc.name).join(', ')}
          </p> */}
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
