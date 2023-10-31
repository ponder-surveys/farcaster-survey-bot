import OpenAI from 'openai'

const openAIApiKey = process.env.OPENAI_API_KEY as string
const openAIClient = new OpenAI({
  apiKey: openAIApiKey,
})

export { openAIClient }
