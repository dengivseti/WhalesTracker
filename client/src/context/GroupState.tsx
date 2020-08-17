import React, {createContext, useEffect, useReducer} from 'react'
import {groupReducer} from "./groupReducer"
import {IGroupState} from "./types"
import {IFilterValues, IGroupValues, IStreamValues} from "../intrefaces/interface"
import {useHttp} from "../hooks/http.hook"
import {useMessage} from "../hooks/message.hook"

function noop(){}

const initialState = {
    groups: [],
    group: null,
    loading: false,
    streams: [],
    stream: null,
    filters: [],
    filter: null,
    error: null,
    fetchGroups: noop,
    fetchGroup: noop,
    clearGroup: noop,
    clearStream: noop,
    addGroup: noop,
    editGroup: noop,
    removeGroup: noop,
    findStream: noop,
    addStream: noop,
    editStream: noop,
    removeStream: noop,
    addFilter: noop,
    updateFilters: noop,
    stateError: noop,
    clearStateError: noop,
    sortedStreams: noop,
    updateStreams: noop,
    editPositionStreams: noop,
    clearFilters: noop,
    updateFilter: noop,
    findFilter: noop,
    editFilter: noop,
    editPositionFilters: noop,
    removeFilter: noop,
    saveEditGroup: noop
}
export const GroupContext = createContext<IGroupState>(initialState)

export const GroupState: React.FC = ({children}) => {
    const { request, error, clearError} = useHttp()
    const {message} = useMessage()
    const [state, dispatch] = useReducer(groupReducer, initialState)

    useEffect(() => {
        if (error) {
            message(error)
            clearError()
        }
    }, [error, clearError, message])

    const fetchGroups = async () => {
        loading()
        try {
            const data = await request('/api/info/groups')
            if (data) {
                dispatch({
                    type: 'FETCH_GROUPS_SUCCESS',
                    groups: data
                })
            }
        } catch (e) {
        }
    }

    const saveEditGroup = async () => {
        loading()
        try{
            const data = {
                group: state.group,
                streams: state.streams
            }
            const id = state.group!._id as string
            const response = await request(`/api/edit/group/${id}`, 'POST', {...data})
            if (response) {
                dispatch({
                    type: 'SAVE_EDIT_GROUP'
                })
                fetchGroups()
                fetchGroup(id)
            }
        }catch (e) {
            stateError()

        }
    }

    const fetchGroup = async (id: string) => {
        loading()
        try {
            const data = await request(`/api/edit/group/${id}`)
            if (data) {
                if (data.streams) {
                    const streams = data.streams.sort((a: any, b: any) => (a['position'] as number) > (b['position'] as number) ? 1: -1)
                    dispatch({type: 'FETCH_STREAMS', streams: streams})
                } else {
                    dispatch({type: 'CLEAR_STREAMS'})
                }
                dispatch({
                    type: 'FETCH_GROUP_SUCCESS',
                    group: data
                })
            }
        } catch (e) {
        }
    }

    const clearGroup = () => {
        dispatch({type: 'CLEAR_GROUP'})
    }

    const addGroup = async (group: IGroupValues) => {
        loading()
        try{
            const data = await request('/api/edit/group/create', 'POST', group)
            if (!data._id){
                return message('Error on create group')
            }
            group._id = data._id
            dispatch({
                type: 'ADD_GROUP',
                group
            })
        }catch (e) {
            clearGroup()
            stateError()
        }
    }

    const editGroup = (group: IGroupValues) => {
        dispatch({
            type: 'EDIT_GROUP',
            group
        })
    }

    const removeGroup = (id: string) => {

    }

    const findStream = (id: string) => {
        clearFilters()
        const stream = state.streams.find(s => s._id === id)
        if (stream && stream!.filters) {
            getFilters(stream)
        }
        dispatch({
            type: 'FIND_STREAM',
            stream: stream!
        })
    }

    const clearStream = () => {
        dispatch({type: 'CLEAR_STREAM'})
    }

    const addStream = async (stream: IStreamValues) => {
        loading()
        try {
            const body = {
                igGroup: state.group!._id,
                ...stream
            }
            const data = await request('/api/edit/stream/create', 'POST', body)
            const id = data._id
            if (id) {
                stream._id = data._id
                stream.filters = []
                dispatch({
                    type: 'ADD_STREAM',
                    stream
                })
            }
        }catch (e) {
            clearStream()
            stateError()
        }
    }

    const editStream = (stream: IStreamValues) => {
        dispatch({
            type: 'EDIT_STREAM',
            stream
        })
    }

    const updateStreams = (stream: IStreamValues) => {
        const streams = state.streams.filter(s => s._id !== stream._id)
        dispatch({
            type: 'UPDATE_STREAMS',
            streams: [...streams, stream]
        })
    }

    const sortedStreams = (): void => {
        const sortedStreams = state.streams.sort((a: any, b: any) => (a['position'] as number) > (b['position'] as number) ? 1: -1)
        dispatch({
            type: 'SORTED_STREAMS',
            streams: sortedStreams
        })
    }

    const editPositionStreams = (streams: IStreamValues[]) => {
        for (let i=0; i < streams.length; i++){
            streams[i]['position'] = i
        }
        dispatch({
            type: 'EDIT_POSITION_STREAMS',
            streams
        })
    }

    const removeStream = async (id: string) => {
        try{
            await request(`/api/edit/group/${state.group!._id}/${id}`, 'DELETE')
            const streams = state.streams.filter(stream => stream._id !== id)
            dispatch({
                type: 'REMOVE_STREAM',
                streams
            })
        }catch (e) {
            stateError()
        }
    }

    const getFilters = (stream: IStreamValues) => {
        const filters = stream!.filters
        if (filters) {
            const sortedFilters = filters.sort((a: any, b: any) => (a['position'] as number) > (b['position'] as number) ? 1: -1)
            dispatch({
                type: 'GET_FILTERS',
                filters: sortedFilters
            })
        }
    }

    const clearFilters = () => {
        dispatch({
            type: 'CLEAR_FILTERS'
        })
    }

    const addFilter = (filter: IFilterValues) => {
        dispatch({
            type: 'ADD_FILTER',
            filter
        })
    }

    const editFilter = (filter: IFilterValues) => {
        const filters = state.filters.filter((f: IFilterValues) => f.position !== filter.position)
        dispatch({
            type: 'EDIT_FILTER',
            filters: [...filters, filter]
        })
    }

    const updateFilters = (filters: IFilterValues[]) => {
        const sortedFilters = filters.sort((a: any, b: any) => (a['position'] as number) > (b['position'] as number) ? 1: -1)
        const stream = state.stream!
        if (!stream._id) {
            return
        }
        const streams = state.streams.filter(s => s._id !== stream._id)
        stream.filters = filters
        dispatch({
            type: 'UPDATE_FILTERS',
            filters: sortedFilters,
            streams: [...streams, stream]
        })
    }

    const findFilter = (position: number) => {
        clearFilter()
        const filter = state.filters.find(f => f.position === position)
        if (filter) {
            updateFilter(filter)
        }
    }

    const updateFilter = (filter: IFilterValues) => {
        dispatch({
            type: 'UPDATE_FILTER',
            filter
        })
    }

    const clearFilter = () => {
        dispatch({
            type: 'CLEAR_FILTER'
        })
    }

    const editPositionFilters = (filters: IFilterValues[]) => {
        for (let i=0; i < filters.length; i++){
            filters[i]['position'] = i
        }
        dispatch({
            type: 'EDIT_POSITION_FILTERS',
            filters
        })
    }

    const removeFilter = (id: number) => {
        const filters = state.filters.filter(f => f.position !== id)
        clearFilter()
        dispatch({
            type: 'REMOVE_FILTER',
            filters
        })
    }

    const loading = () => {
        dispatch({type: 'START_LOADING'})
    }

    const stateError = () => {
        dispatch({type: 'ERROR'})
    }

    const clearStateError = () => {
        dispatch({type: 'CLEAR_ERROR'})
    }


    return (
        <GroupContext.Provider value={{
            fetchGroups, fetchGroup, addGroup, editGroup, sortedStreams, updateStreams,
            removeGroup, addStream, editStream, removeStream, findStream, editPositionStreams,
            clearFilters, findFilter, editFilter, editPositionFilters, removeFilter,
            updateFilter, addFilter, updateFilters, clearGroup, stateError, clearStream,
            clearStateError, saveEditGroup,
            groups: state.groups,
            loading: state.loading,
            group: state.group,
            streams: state.streams,
            error: state.error,
            stream: state.stream,
            filters: state.filters,
            filter: state.filter
        }}>
            {children}
        </GroupContext.Provider>
    )
}