import * as React from 'react'
import {Card, CardTitle, CardContent} from '@/components/ui/card'
import {Movie} from '@/lib/tmdb'
import {Skeleton} from './ui/skeleton'
import Link from 'next/link'

interface MovieCardProps {
  movie: Movie
}

function MovieCard({movie: {id, title, poster_path}}: MovieCardProps) {
  return (
    <Link href={`/movie/${id}`}>
      <Card className="h-full w-full movie-card">
        <div className="overflow-hidden">
          <img
            src={`https://image.tmdb.org/t/p/original/${poster_path}`}
            alt={title}
            className="w-full h-64 object-cover rounded-t-lg transform transition-all duration-500 ease-in-out hover:scale-110"
          />
        </div>
        <CardContent className="p-2">
          <CardTitle className="text-xs md:text-sm">{title}</CardTitle>
        </CardContent>
      </Card>
    </Link>
  )
}

function MovieCardSkeleton() {
  return (
    <Card className="h-full  w-full">
      <Skeleton className="h-64 w-full" />
      <CardContent className="p-1">
        <Skeleton className="w-full h-5" />
      </CardContent>
    </Card>
  )
}

MovieCardSkeleton.displayName = 'MovieCard.Skeleton'

MovieCard.Skeleton = MovieCardSkeleton

export default MovieCard
