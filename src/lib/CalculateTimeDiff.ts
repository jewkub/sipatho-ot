export const CalculateTimeDiff = (start: string, end: string, isWeekend: boolean, options?: { format?: boolean }) => {
  const startHr = parseInt(start.slice(0, -3))
  const endHr = parseInt(end.slice(0, -3))
  const start30 = parseInt(start.at(-2)!) == 3
  const end30 = parseInt(end.at(-2)!) == 3
  if (isWeekend && (startHr == 12 || (endHr == 12 && end30))) throw 'time range invalid'
  if (endHr < startHr) throw 'time range invalid'
  if (endHr == startHr && !end30 && start30) throw 'time range invalid'
  const resultHr = endHr - startHr - (+(!end30 && start30)) - (+(startHr < 12 && endHr > 13))
  if (options?.format) return `${resultHr ? resultHr + ' ชั่วโมง' : ''}${end30 != start30 ? ' 30 นาที' : ''}`
  return [resultHr, end30 != start30 ? 30 : 0]
}
