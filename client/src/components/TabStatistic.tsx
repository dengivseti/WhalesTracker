import React, {useContext, useEffect} from 'react'
import { MenuStatistic } from './MenuStatistic'
import {StatisticContext} from "../context/StatisticState"
import {Loader} from "./Loader"
import {TableStatistic} from "./TableStatistic"



export const TabStatistic: React.FC = () => {
    const {type, fetchStats, loading} = useContext(StatisticContext)

    useEffect(() => {
        fetchStats()
    }, [type])

    return (
        <div>
            <MenuStatistic/>
            {loading ? <Loader/> : <TableStatistic/>}
        </div>
    )
}