import React, { useContext, useState } from 'react'
import { Tab, Tabs } from '@material-ui/core'
import { TabStatistic } from '../components/TabStatistic'
import { StatisticContext } from '../context/StatisticState'

export const TAB: { [T: string]: number } = {
  day: 0,
  country: 1,
  device: 2,
  query: 3,
}

function a11yProps(index: any) {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  }
}

export const StatisticPage: React.FC = () => {
  const { setType, loading, type } = useContext(StatisticContext)
  const [value, setValue] = useState<number>(TAB[type])

  const handleChange = (
    event: React.ChangeEvent<{}>,
    newValue: number,
  ) => {
    setValue(newValue)
    for (let key in TAB) {
      if (TAB[key] === newValue) {
        setType(key)
        break
      }
    }
  }
  return (
    <>
      <Tabs
        value={value}
        onChange={handleChange}
        indicatorColor="primary"
        textColor="primary"
        centered
      >
        <Tab label="Days" disabled={loading} {...a11yProps('day')} />
        <Tab
          label="Countries"
          disabled={loading}
          {...a11yProps('country')}
        />
        <Tab
          label="Devices"
          disabled={loading}
          {...a11yProps('device')}
        />
        <Tab
          label="Queries"
          disabled={loading}
          {...a11yProps('query')}
        />
      </Tabs>
      <TabStatistic />
    </>
  )
}
