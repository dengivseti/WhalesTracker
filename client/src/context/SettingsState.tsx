import React, { createContext, useEffect, useReducer } from 'react'
import { useHttp } from '../hooks/http.hook'
import { useMessage } from '../hooks/message.hook'
import { IGeneralSettings, ISettingsState } from './types'
import { settingsReduser } from './settingsReducer'
import {
  typeActionListOption,
  typeList,
} from '../intrefaces/interface'

function noop() {}

const initialState: ISettingsState = {
  loading: false,
  list: [],
  typeList: null,
  general: null,
  intBlackIp: 0,
  intBlackSignature: 0,
  intRemoteUrl: 0,
  modal: false,
  action: 'add',
  fetchSettings: noop,
  updateSettings: noop,
  fetchList: noop,
  setModal: noop,
  setAction: noop,
  saveList: noop,
  setTypeList: noop,
  clearList: noop,
}

export const SettingsContext = createContext<ISettingsState>(
  initialState,
)

export const SettingsState: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(settingsReduser, initialState)
  const { request, error, clearError } = useHttp()
  const { message } = useMessage()
  useEffect(() => {
    if (error) {
      message(error)
      clearError()
    }
  }, [error, clearError, message])

  const fetchSettings = async () => {
    startLoading()
    try {
      const response = await request(`/api/settings/info`)
      if (!response) {
        settingsError()
        return
      }
      dispatch({ type: 'FETCH_SETTINGS', values: { ...response } })
    } catch (e) {
      settingsError()
    }
  }

  const fetchList = async (listName: typeList) => {
    startLoading()
    try {
      const response = await request(
        `/api/settings/info/list?type=${listName}`,
      )
      if (!response) {
        settingsError()
        return
      }
      dispatch({ type: 'FETCH_LIST', values: [...response.data] })
    } catch (e) {
      settingsError()
    }
  }

  const updateSettings = async (data: IGeneralSettings) => {
    startLoading()
    try {
      const response = await request(
        `/api/settings/edit/general`,
        'POST',
        { ...data },
      )
      if (response) {
        dispatch({ type: 'UPDATE', values: { ...data } })
      }
    } catch (e) {
      settingsError()
    }
  }

  const clearList = async (typeList: typeList) => {
    startLoading()
    try {
      const body = {
        action: 'clear',
        typeList,
        data: [],
      }
      const response = await request(
        `/api/settings/edit/list`,
        'POST',
        { ...body },
      )
      if (response) {
        const {
          intBlackIp,
          intBlackSignature,
          intRemoteUrl,
        } = response
        dispatch({
          type: 'UPDATE_COUNT_LIST',
          intRemoteUrl,
          intBlackSignature,
          intBlackIp,
        })
      }
      finishLoading()
    } catch (e) {
      settingsError()
    }
  }

  const saveList = async (data: string[]) => {
    startLoading()
    try {
      const body = {
        action: state.action,
        typeList: state.typeList,
        data: Array.from(new Set(data)).filter((str) => str.trim()),
      }
      const response = await request(
        `/api/settings/edit/list`,
        'POST',
        { ...body },
      )
      if (response) {
        const {
          intBlackIp,
          intBlackSignature,
          intRemoteUrl,
        } = response
        dispatch({
          type: 'UPDATE_COUNT_LIST',
          intRemoteUrl,
          intBlackSignature,
          intBlackIp,
        })
      }
      finishLoading()
    } catch (e) {
      settingsError()
    }
  }
  const setTypeList = (typeList: typeList) => {
    dispatch({ type: 'SET_TYPE_LIST', typeList })
  }
  const setModal = () => {
    dispatch({ type: 'SET_MODAL' })
  }
  const setAction = (typeAction: typeActionListOption) => {
    dispatch({ type: 'SET_ACTION', typeAction })
  }
  const settingsError = () => {
    dispatch({ type: 'ERROR' })
  }
  const startLoading = () => {
    dispatch({ type: 'START_LOADING' })
  }
  const finishLoading = () => {
    dispatch({ type: 'FINISH_LOADING' })
  }
  return (
    <SettingsContext.Provider
      value={{
        loading: state.loading,
        general: state.general,
        list: state.list,
        typeList: state.typeList,
        intBlackIp: state.intBlackIp,
        intBlackSignature: state.intBlackSignature,
        intRemoteUrl: state.intRemoteUrl,
        modal: state.modal,
        action: state.action,
        fetchSettings,
        updateSettings,
        fetchList,
        setModal,
        setAction,
        saveList,
        setTypeList,
        clearList,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}
