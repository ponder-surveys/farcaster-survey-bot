import * as echarts from 'echarts'
import { createCanvas } from 'canvas'
import { buildImgurClient } from '../clients/imgur'
import { getDateTag } from './getDateTag'

const uploadChart = async (id: number, canvas: Buffer) => {
  const imgur = buildImgurClient()

  const response = await imgur.upload({
    image: canvas,
    type: 'stream',
  })

  if (response.status !== 200 || !response.data.link) {
    throw new Error(`${getDateTag()} Error uploading chart`)
  }

  return response.data.link
}

const createChart = async (
  id: number,
  optionCounts: OptionCounts,
  total: number
) => {
  const canvas = createCanvas(600, 400) as any
  const chart = echarts.init(canvas)

  chart.setOption({
    backgroundColor: '#110518',
    xAxis: {
      type: 'category',
      data: Object.keys(optionCounts).map(Number),
    },
    yAxis: {
      type: 'value',
      show: false,
    },
    series: [
      {
        data: Object.values(optionCounts),
        type: 'bar',
        label: {
          show: true,
          position: 'top',
          color: '#fff',
        },
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: '#9c2be2',
              },
              {
                offset: 1,
                color: '#1f092d',
              },
            ],
          },
        },
      },
    ],
    graphic: {
      type: 'text',
      left: 'center',
      top: 20,
      style: {
        text: `Total Votes: ${total}`,
        fontSize: 16,
        fill: 'white',
      },
    },
  })

  const canvasBuffer = canvas.toBuffer()
  const url = await uploadChart(id, canvasBuffer)

  return url
}

export { createChart }
