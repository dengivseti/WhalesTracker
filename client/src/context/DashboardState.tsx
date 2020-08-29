import React, {createContext, useEffect, useReducer} from 'react'
import {IDashboardState, IStatsDashboard} from "./types"
import {dashboardReducer} from "./dashboardReducer"
import {useHttp} from "../hooks/http.hook"
import {useMessage} from "../hooks/message.hook"
import {IMenuDashboardValues} from "../intrefaces/interface";

function noop() {
}

const initialState: IDashboardState = {
    interval: 'day',
    groups: [],
    streams: [],
    country: [],
    ignoreBot: false,
    loading: false,
    stats: [],
    typeLines: 'hits',
    amount: 0,
    hits: 0,
    sales: 0,
    uniques: 0,
    fetchDashboard: noop,
    updateValue: noop
}

export const DashboardContext = createContext<IDashboardState>(initialState)

export const DashboardState: React.FC = ({children}) => {
    const {request, error, clearError} = useHttp()
    const {message} = useMessage()
    const [state, dispatch] = useReducer(dashboardReducer, initialState)

    useEffect(() => {
        if (error){
            message(error)
            clearError()
        }
    }, [error, clearError, message])

    const renameValue = (stat: IStatsDashboard) => {
        if (state.interval === 'day'){
            if (stat.value.length === 1){
                return `0${stat.value}:00`
            }else{
                return `${stat.value}:00`
            }
        }else{
            switch (stat.value.toString()){
                case '0':
                    return 'Mon'
                case '1':
                    return 'Tue'
                case '2':
                    return 'Wed'
                case '3':
                    return 'Thu'
                case '4':
                    return 'Fri'
                case '5':
                    return 'Sat'
                case '6':
                    return 'Sun'
            }
        }
    }

    const fetchDashboard = async () => {
        startLoading()
        try {
            const stats: IStatsDashboard[] = []
            const query = {
                type: state.interval,
                groups: state.groups.join('|'),
                streams: state.streams.join('|'),
                ignoreBot: state.ignoreBot ? '1' : '',
                country: state.country.join('|')
            }
            const data = await request('/api/info/stats/dashboard', 'GET', null, {}, query)
            let hits = 0
            let uniques = 0
            let sales = 0
            let amount = 0
            if (data && data.stats) {
                data.stats.forEach((stat: IStatsDashboard) => {
                    hits += stat.hits
                    uniques += stat.uniques
                    sales += stat.sales
                    amount += stat.amount
                    const value = renameValue(stat) as string
                    stats.push({...stat, value})
                })
                dispatch({
                    type: 'FETCH_DASHBOARD',
                    stats, hits, uniques, sales, amount
                })
            }
        }catch (e) {
            dashboardError()
        }
    }

    const updateValue = (menuDashboard: IMenuDashboardValues) => {
        const value: IMenuDashboardValues = {
            interval: menuDashboard.interval,
            country: menuDashboard.country,
            groups: menuDashboard.groups,
            streams: menuDashboard.streams,
            ignoreBot: menuDashboard.ignoreBot,
            typeLines: menuDashboard.typeLines
        }
        dispatch({
            type: 'UPDATE',
            menu: value
        })
    }


    const dashboardError = () => {
        dispatch({type: 'ERROR'})
    }

    const startLoading = () => {
        dispatch({type: 'START_LOADING'})
    }

    return (
        <DashboardContext.Provider value={{
            stats: state.stats,
            loading: state.loading,
            ignoreBot: state.ignoreBot,
            country: state.country,
            streams: state.streams,
            groups: state.groups,
            interval: state.interval,
            typeLines: state.typeLines,
            uniques: state.uniques,
            hits: state.hits,
            sales: state.sales,
            amount: state.amount,
            fetchDashboard, updateValue
        }}>
            {children}
        </DashboardContext.Provider>
    )
}