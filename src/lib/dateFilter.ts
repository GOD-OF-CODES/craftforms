export function buildDateRangeFilter(
  startDate: string | null,
  endDate: string | null
): Record<string, Date> | undefined {
  if (!startDate && !endDate) return undefined

  const filter: Record<string, Date> = {}
  if (startDate) filter.gte = new Date(startDate)
  if (endDate) filter.lte = new Date(endDate)
  return filter
}
