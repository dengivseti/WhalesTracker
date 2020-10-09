import React, { useContext } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { DashboardContext } from '../context/DashboardState'
import { Loader } from './Loader'
import { makeStyles, Theme } from '@material-ui/core/styles'

const useStyle = makeStyles((theme: Theme) => ({
  root: {
    paddingTop: theme.spacing(3, 0, 5, 0),
  },
}))

export const Chart: React.FC = () => {
  const { stats, typeLines } = useContext(DashboardContext)
  const classes = useStyle()

  if (!stats.length) {
    return <Loader />
  }

  return (
    <ResponsiveContainer
      width="99%"
      maxHeight={400}
      aspect={1}
      className={classes.root}
    >
      <LineChart width={730} height={500} data={stats}>
        <XAxis dataKey="value" />
        <YAxis hide={true} />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Line
          type="monotone"
          dataKey={typeLines}
          stroke="#607d8b"
          strokeWidth={5}
          activeDot={{ r: 18 }}
        />

        <Line
          type="monotone"
          dataKey={`${typeLines}_last`}
          stroke="#82ca9d"
          strokeWidth={3}
          strokeDasharray="3 3"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
