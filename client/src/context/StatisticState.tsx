import React, {createContext, useCallback, useEffect, useReducer} from 'react'
import {IStatisticState, IStats} from './types'
import { statisticReducer } from './statisticReducer'
import {useHttp} from "../hooks/http.hook"
import {useMessage} from "../hooks/message.hook"
import {StatisticType, IMenuStatsValues} from '../intrefaces/interface'

const storageKey: string = 'Stats'
const current = new Date()
function noop() {
}

const statState: IMenuStatsValues = {
    type: 'day',
    ignoreBot: false,
    // startDate: new Date(current.getTime()),
    startDate: new Date(new Date().setDate(new Date().getDate()-15)),
    endDate: new Date(),
    interval: 'today',
    country: [],
    groups: [],
    streams: []
}

const initialStateDefault: IStatisticState = {
    ...statState,
    loading: true,
    stats: [],
    setType: noop,
    fetchStats: noop,
    startLoading: noop,
    updateLocalStorage: noop,
}

const getInitialState = () => {
    const data: IMenuStatsValues = JSON.parse(localStorage.getItem(storageKey)!)
    if (data){
        const value = {
            ...statState,
            ...data,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate)
        }
        return {...initialStateDefault, ...value}
    }
    return initialStateDefault
}

export const StatisticContext = createContext<IStatisticState>(getInitialState())

export const StatisticState: React.FC = ({children}) => {
    const { request, error, clearError} = useHttp()
    const {message} = useMessage()
    const [state, dispatch] = useReducer(statisticReducer, getInitialState())

    useEffect(() => {
        if (error) {
            message(error)
            clearError()
        }
    }, [error, clearError, message])

    const fetchStats = async () => {
        startLoading()
        try {
            const query = {
                type: state.type,
                groups: state.groups.join('|'),
                streams: state.streams.join('|'),
                ignoreBot: state.ignoreBot ? '1' : '',
                startDate: state.startDate.toISOString().substring(0, 10),
                endDate: state.endDate.toISOString().substring(0, 10),
                country: state.country.join('|'),
            }
            const data = await request(`/api/info/stats`, 'GET', null, {}, query)
            if (data && data.stats){
                dispatch({
                    type: 'FETCH_STATS',
                    stats: data.stats
                })
            }
        }catch (e) {
            statsError()
        }
    }

    const setType = (type: StatisticType) => {
        dispatch({
            type: 'SET_TYPE',
            t: type,
        })
    }

    const updateLocalStorage = (menuStats: IMenuStatsValues) => {
        const value: IMenuStatsValues = {
            type: menuStats.type,
            country: menuStats.country,
            ignoreBot: menuStats.ignoreBot,
            interval: menuStats.interval,
            startDate: menuStats.startDate,
            endDate: menuStats.endDate,
            groups: menuStats.groups,
            streams: menuStats.streams
        }
        dispatch({
            type: 'UPDATE_LOCAL_STORAGE',
            menu: value
        })
        localStorage.setItem(storageKey, JSON.stringify(value))
    }

    const clearStats = () => {
        dispatch({
            type: 'CLEAR_STATS'
        })
    }

    const startLoading = () => {
        dispatch({
            type: 'START_LOADING'
        })
    }

    const statsError = () => {
        dispatch({type: 'ERROR'})
    }

    return (
        <StatisticContext.Provider value={{
            type: state.type,
            groups: state.groups,
            streams: state.streams,
            ignoreBot: state.ignoreBot,
            startDate: state.startDate,
            endDate: state.endDate,
            loading: state.loading,
            country: state.country,
            stats: state.stats,
            interval: state.interval,
            setType, fetchStats, startLoading, updateLocalStorage,
        }}>
            {children}
        </StatisticContext.Provider>
    )
}