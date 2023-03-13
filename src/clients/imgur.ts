import ImgurClient from 'imgur'

const buildImgurClient = () => {
  const clientId = process.env.IMGUR_CLIENT_ID as string
  const clientSecret = process.env.IMGUR_CLIENT_SECRET as string
  const refreshToken = process.env.IMGUR_REFRESH_TOKEN as string
  const client = new ImgurClient({ clientId, clientSecret, refreshToken })

  return client
}

export { buildImgurClient }
