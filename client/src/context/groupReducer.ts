import { IGroupState, ActionGroup } from './types'

export const groupReducer = (
  state: IGroupState,
  action: ActionGroup,
) => {
  switch (action.type) {
    case 'START_LOADING':
      return { ...state, loading: true }
    case 'FETCH_GROUPS_SUCCESS':
      return { ...state, groups: action.groups, loading: false }
    case 'FETCH_GROUP_SUCCESS':
      return { ...state, group: action.group, loading: false }
    case 'CLEAR_GROUP':
      return { ...state, group: null }
    case 'ADD_GROUP':
      return {
        ...state,
        groups: [...state.groups, action.group],
        group: action.group,
        loading: false,
      }
    case 'ERROR':
      return { ...state, loading: false }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    case 'EDIT_GROUP':
      return { ...state, group: { ...state.group, ...action.group } }
    case 'FETCH_STREAMS':
      return { ...state, streams: action.streams }
    case 'CLEAR_STREAMS':
      return { ...state, streams: [] }
    case 'FIND_STREAM':
      return { ...state, stream: action.stream }
    case 'CLEAR_STREAM':
      return { ...state, stream: null }
    case 'EDIT_STREAM':
      return {
        ...state,
        stream: { ...state.stream, ...action.stream },
      }
    case 'ADD_STREAM':
      return {
        ...state,
        streams: [...state.streams, action.stream],
        stream: action.stream,
        loading: false,
      }
    case 'SORTED_STREAMS':
      return { ...state, streams: action.streams }
    case 'UPDATE_STREAMS':
      return { ...state, streams: action.streams }
    case 'EDIT_POSITION_STREAMS':
      return { ...state, streams: action.streams }
    case 'GET_FILTERS':
      return { ...state, filters: action.filters }
    case 'CLEAR_FILTERS':
      return { ...state, filters: [], filter: null }
    case 'ADD_FILTER':
      return {
        ...state,
        filters: [...state.filters, action.filter],
        filter: null,
      }
    case 'CLEAR_FILTER':
      return { ...state, filter: null }
    case 'UPDATE_FILTER':
      return { ...state, filter: action.filter }
    case 'UPDATE_FILTERS':
      return {
        ...state,
        filters: action.filters,
        streams: action.streams,
      }
    case 'EDIT_FILTER':
      return { ...state, filters: action.filters, filter: null }
    case 'EDIT_POSITION_FILTERS':
      return { ...state, filters: action.filters }
    case 'REMOVE_FILTER':
      return { ...state, filters: action.filters }
    case 'SAVE_EDIT_GROUP':
      return {
        ...state,
        loading: false,
        group: null,
        streams: [],
        filters: [],
        stream: null,
        filter: null,
      }
    case 'REMOVE_STREAM':
      return { ...state, streams: action.streams }
    default:
      return state
  }
}
