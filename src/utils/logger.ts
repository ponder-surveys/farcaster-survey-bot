import pino from 'pino'

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: undefined,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
})

export default logger
