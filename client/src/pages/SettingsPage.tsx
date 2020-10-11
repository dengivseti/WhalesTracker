import React, { useContext, useEffect, useState } from 'react'
import { Tab } from '@material-ui/core'
import { TabContext, TabList, TabPanel } from '@material-ui/lab'
import { GeneralOption } from '../components/GeneralOption'
import { SettingsContext } from '../context/SettingsState'
import { Loader } from '../components/Loader'
import { OtherOption } from '../components/OtherOption'

export const SettingsPage: React.FC = () => {
  const [value, setValue] = useState<string>('general')
  const { fetchSettings, loading } = useContext(SettingsContext)

  useEffect(() => {
    fetchSettings()
  }, [])

  if (loading) {
    return <Loader />
  }

  return (
    <TabContext value={value}>
      <TabList
        onChange={(event, value) => setValue(value)}
        centered={true}
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab label="General" value="general" />
        <Tab label="Other" value="other" />
      </TabList>
      <TabPanel value="general">
        <GeneralOption />
      </TabPanel>
      <TabPanel value="other">
        <OtherOption />
      </TabPanel>
    </TabContext>
  )
}
