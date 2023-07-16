import {type ClassValue, clsx} from 'clsx'
import {twMerge} from 'tailwind-merge'
import {QueryClient} from '@tanstack/react-query'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})

class FetchError extends Error {
  info: any
  status: number

  constructor(message: string, status: number, info: any) {
    super(message)
    this.status = status
    this.info = info
  }
}

export const fetcher = async <T = any>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<T> => {
  const res = await fetch(input, init)
  if (!res.ok) {
    const info = await res.json()
    const error = new FetchError(
      'An error occurred while fetching the data.',
      res.status,
      info,
    )
    throw error
  }
  return res.json() as T
}
