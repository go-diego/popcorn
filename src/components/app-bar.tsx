import {Button} from '@/components/ui/button'
import Link from 'next/link'

export default function AppBar({onOpenSearch}: {onOpenSearch: () => void}) {
  return (
    <header className="py-1 sm:py-2 supports-backdrop-blur:bg-background/60 sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="flex justify-between items-center md:container md:mx-auto px-2 sm:px-8">
        <Link href="/">
          <span className="text-lg sm:text-4xl">🍿Popcorn</span>
        </Link>
        <Button onClick={onOpenSearch} variant="outline">
          Search...
          <span className="text-sm pl-2">🔎</span>
        </Button>
      </div>
    </header>
  )
}
