import { openAIClient } from '../clients/openai'

const categorizeResponseWithGPT = async (
  question: string,
  choices: string[],
  responseText: string
) => {
  const choicesText = choices
    .map((choice, index) => `${index + 1}. ${choice}`)
    .join('\n')

  const systemPrompt = `Given the survey question and its choices, identify if the response text indicates a choice between options 1 to 5, even if the number isn't explicitly mentioned. Extract the most probable option number and any subsequent comment. If multiple options are implied, choose the one that seems more likely to match the sentiment of the option. Only if there is absolutely no possible way to group the response in one of the survey choices, will you say "No". However, there should usually be an option to group under, unless it's a significantly unrelated response. After the Option and Comment are laid out, please describe your reasoning for why you chose your answer relative to the instructions above.`

  const userPrompt = `
    Survey Question: ${question}\n
    Choices: ${choicesText} \n
    Response: ${responseText}
    `

  const response = await openAIClient.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 1,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  })

  return response.choices[0].message
}

export { categorizeResponseWithGPT }
