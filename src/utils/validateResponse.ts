const validateResponse = (response: string) => {
  const validator = new RegExp(/^([1-5])\W*(.*?)$/s)
  const match = response.match(validator)
  return match
}

export { validateResponse }
