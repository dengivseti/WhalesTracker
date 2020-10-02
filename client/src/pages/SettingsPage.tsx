import React, {useContext, useEffect, useState} from 'react'
import {Tab} from "@material-ui/core";
import {TabContext, TabList, TabPanel} from "@material-ui/lab"
import {GeneralOption} from "../components/GeneralOption";
import {SettingsContext} from "../context/SettingsState";
import {Loader} from "../components/Loader";

export const SettingsPage: React.FC = () => {
    const [value, setValue] = useState<string>('general')
    const {fetchSettings, loading} = useContext(SettingsContext)

    useEffect(() => {
        fetchSettings()
    }, [])

    if (loading) {
        return <Loader/>
    }

    return (
        <TabContext value={value}>
                <TabList
                    onChange={(event, value) => setValue(value)}
                    centered={true}
                    indicatorColor="primary"
                    textColor="primary">
                        <Tab label="General" value='general'/>
                        <Tab label="Bots" value='bots'/>
                        <Tab label="Remote" value='remote'/>
                </TabList>
            <TabPanel value='general'><GeneralOption/></TabPanel>
            <TabPanel value='bots'>Bots</TabPanel>
            <TabPanel value='remote'>Remote</TabPanel>
        </TabContext>
    )
}
