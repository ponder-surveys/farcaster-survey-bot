const getDateTag = () => {
  const today = new Date()
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'America/New_York', // Use EST for now
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }

  const formattedDateTime = today.toLocaleString('en-US', options)

  return `\n[${formattedDateTime} EST]`
}

export { getDateTag }
