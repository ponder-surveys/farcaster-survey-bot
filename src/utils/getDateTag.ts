const getDateTag = () => {
  const today = new Date()
  const formattedDate = `${today.getMonth() + 1}/${today.getDate()}/${today
    .getFullYear()
    .toString()}`

  return `\n[${formattedDate}]`
}

export { getDateTag }
