const roundPercentages = (dataset: number[]) => {
  const diff =
    100 - dataset.map(Math.floor).reduce((acc, curr) => acc + curr, 0)

  const indices = dataset.map((_, index) => index)

  const sortedIndices = indices.sort(
    (a, b) =>
      Math.floor(dataset[a]) -
      dataset[a] -
      (Math.floor(dataset[b]) - dataset[b])
  )

  const roundedDataset = dataset.map((e) => Math.floor(e))

  for (let i = 0; i < diff; i++) {
    const index = sortedIndices[i]
    roundedDataset[index] += 1
  }

  return roundedDataset
}

export { roundPercentages }
