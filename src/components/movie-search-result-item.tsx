import {Movie} from '@/lib/tmdb'
import Link from 'next/link'
import {format} from 'date-fns'

export function MovieSearchResultItem({
  onMovieSelect,
  movie: {id, title, poster_path, release_date},
}: {
  onMovieSelect: () => void
  movie: Movie
}) {
  return (
    <li>
      <Link href={`/movie/${id}`} onClick={onMovieSelect}>
        <div className="flex p-2 gap-2 rounded hover:bg-slate-600 align-center">
          <img
            src={`https://image.tmdb.org/t/p/w500${poster_path}`}
            alt={title}
            className="w-10 h-10 object-cover rounded"
          />
          <div>
            <p className="text-sm">{title}</p>
            {/* NOTE: this _should_ be defined but there are some test entries that don't have release date defined */}
            {release_date && (
              <p className="text-xs text-slate-500">
                {`Released ${format(new Date(release_date), 'MMMM d, yyyy')}`}
              </p>
            )}
          </div>
        </div>
      </Link>
    </li>
  )
}
