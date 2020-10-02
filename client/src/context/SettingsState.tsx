import React, {createContext, useEffect, useReducer} from 'react'
import {useHttp} from '../hooks/http.hook'
import {useMessage} from "../hooks/message.hook";
import {IGeneralSettings, ISettingsState} from "./types";
import {settingsReduser} from "./settingsReducer";

function noop() {
}

const initialState: ISettingsState = {
    loading: false,
    blackIp: [],
    blackSignature: [],
    remoteUrl: [],
    general: null,
    fetchSettings: noop,
    updateSettings: noop
}

export const SettingsContext = createContext<ISettingsState>(initialState)

export const SettingsState: React.FC = ({children}) => {
    const [state, dispatch] = useReducer(settingsReduser, initialState)
    const {request, error, clearError} = useHttp()
    const {message} = useMessage()
    useEffect(() => {
        if (error){
            message(error)
            clearError()
        }
    }, [error, clearError, message])

    const fetchSettings = async () => {
        startLoading()
        try{
            const response = await request(`/api/settings/info`)
            if (!response) {
                settingsError()
                return
            }
            dispatch({type: 'FETCH_SETTINGS', values: {...response}})
        }catch (e) {
            settingsError()
        }
    }

    const updateSettings = async (data: IGeneralSettings) => {
        startLoading()
        try{
            const response = await request(`/api/settings/edit/general`, 'POST', {...data})
            if (response) {
                dispatch({type: 'UPDATE', values: {...data}})
            }
        }catch (e) {
            settingsError()
        }
    }

    const settingsError = () => {
        dispatch({type: 'ERROR'})
    }
    const startLoading = () => {
        dispatch({type: 'START_LOADING'})
    }
    return (
        <SettingsContext.Provider value={{
            loading: state.loading,
            general: state.general,
            remoteUrl: state.remoteUrl,
            blackSignature: state.blackSignature,
            blackIp: state.blackIp,
            fetchSettings, updateSettings
        }}>
            {children}
        </SettingsContext.Provider>
    )
}