import ImgurClient from 'imgur'

const clientId = process.env.IMGUR_CLIENT_ID as string
const clientSecret = process.env.IMGUR_CLIENT_SECRET as string
const refreshToken = process.env.IMGUR_REFRESH_TOKEN as string
const imgurClient = new ImgurClient({ clientId, clientSecret, refreshToken })

export { imgurClient }
