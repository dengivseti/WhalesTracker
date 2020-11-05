import React from 'react'
import { Typography } from '@material-ui/core'

export const InfoPage = () => {
  return (
    <>
      <br />
      <Typography variant="body1">
        Документация и вся информация по настройке.{' '}
        <a href="https://whalestracker.netlify.app/" target="_blank">
          https://whalestracker.netlify.app/
        </a>
      </Typography>
      <br />
      <Typography variant="body1">
        Github проекта{' '}
        <a
          href="https://github.com/dengivseti/WhalesTracker"
          target="_blank"
        >
          https://github.com/dengivseti/WhalesTracker
        </a>
      </Typography>
      <br />
      <Typography variant="body1">
        Не забудьте подписаться на группу в{' '}
        <a href="https://t.me/WhalesTracker" target="_blank">
          Телеграм.
        </a>{' '}
        Поставить звезду ⭐ на{' '}
        <a
          href="https://github.com/dengivseti/WhalesTracker"
          target="_blank"
        >
          Github
        </a>
        .
      </Typography>
      <br />
      <Typography variant="body1">
        Все вопросы и предложения принимаются через{' '}
        <a
          href="https://github.com/dengivseti/WhalesTracker/issues"
          target="_blank"
        >
          Issues
        </a>{' '}
        Github проекта .
      </Typography>
    </>
  )
}
