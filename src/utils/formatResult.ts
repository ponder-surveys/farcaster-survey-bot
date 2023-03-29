import { roundPercentages } from './roundPercentages'

const formatResult = (
  result: Question,
  optionCounts: OptionCounts,
  total: number
) => {
  const { title, option_1, option_2, option_3, option_4, option_5, author } =
    result

  const top = `Survey results${author ? ` for @${author}` : ''}`

  const values = Object.values(optionCounts)
  const percentOptions = roundPercentages(values.map((o) => (o / total) * 100))
  const max = Math.max(...values)
  const optionsData = [
    { percent: percentOptions[0] || 0, option: option_1 },
    { percent: percentOptions[1] || 0, option: option_2 },
    { percent: percentOptions[2] || 0, option: option_3 },
    { percent: percentOptions[3] || 0, option: option_4 },
    { percent: percentOptions[4] || 0, option: option_5 },
  ]
  const options = optionsData
    .filter((o) => o.option)
    .map(
      (o, i) =>
        `${i + 1}. ${o.percent}% ${o.option} ${values[i] === max ? '✅' : ''}`
    )
    .join('\n')

  return `${top}\n\n${title}\n${options}`
}

export { formatResult }
