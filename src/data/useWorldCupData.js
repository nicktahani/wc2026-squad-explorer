import { useQuery } from '@tanstack/react-query'
import { fetchAllRaw } from './openfootballClient'
import { normalizeWorldCup } from './normalize'

export function useWorldCupData() {
  const query = useQuery({
    queryKey: ['worldcup', '2026'],
    queryFn: async ({ signal }) => normalizeWorldCup(await fetchAllRaw({ signal })),
    gcTime: 1000 * 60 * 60 * 6,
  })

  return {
    data: query.data ?? null,
    loading: query.isPending,
    error: query.error,
    reload: () => query.refetch(),
  }
}
