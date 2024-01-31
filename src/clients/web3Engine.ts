import { Engine } from '@thirdweb-dev/engine'

const engineUrl = process.env.WEB3_ENGINE_URL as string
const accessToken = process.env.WEB3_ACCESS_TOKEN as string

const web3Engine = new Engine({
  url: `https://${engineUrl}`,
  accessToken: accessToken,
})

export { web3Engine }
