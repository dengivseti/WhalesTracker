import {
  IFilterValues,
  IGroupValues,
  IMenuDashboardValues,
  IMenuStatsValues,
  IOffer,
  IStreamValues,
  StatisticType,
  typeActionListOption,
  typeChartLineDashboard,
  typeInterval,
  typeIntervalDashboard,
  typeList,
  typeTrash,
} from '../intrefaces/interface'

export interface IStatsDashboard {
  value: string
  hits: number
  uniques: number
  sales: number
  amount: number
  hits_last: number
  uniques_last: number
  sales_last: number
  amount_last: number
}

export interface ILastClick {
  date: string
  group: string
  stream: string
  device: string
  country: string
  city: string
  ip: string
  useragent: string
  unique: boolean
  isBot: boolean
  out: string
}

export interface ILastAmount {
  date: string
  group: string
  stream: string
  device: string
  country: string
  city: string
  ip: string
  useragent: string
  amount: string
}

export interface IGeneralSettings {
  postbackKey: string
  clearDayStatistic: number
  language?: 'ru' | 'en'
  trash: typeTrash
  trashUrl: string | null
  logLimitClick: number
  logLimitAmount: number
  getKey: string
  protect?: string
  sendTelegram?: boolean
  telegramBotToken?: string
  telegramChatId?: string
  clearRemote: number
}

export interface IOfferState {
  loading: boolean
  modal: boolean
  offers: IOffer[]
  offer: IOffer | null
  fetchOffer: () => void
  saveOffer: (offer: IOffer) => void
  setModal: () => void
  deleteOffer: (id: string) => void
  selectOffer: (offer: IOffer) => void
}

export interface ISettingsState {
  loading: boolean
  general: IGeneralSettings | null
  list: string[]
  typeList: typeList | null
  intBlackIp: number
  intBlackSignature: number
  intRemoteUrl: number
  modal: boolean
  action: typeActionListOption
  fetchSettings: () => void
  updateSettings: (values: IGeneralSettings) => void
  fetchList: (listName: typeList) => void
  setModal: () => void
  setAction: (typeAction: typeActionListOption) => void
  setTypeList: (typeList: typeList) => void
  saveList: (data: string[]) => void
  clearList: (typeList: typeList) => void
}

export type ActionOffer =
  | { type: 'START_LOADING' }
  | { type: 'FINISH_LOADING' }
  | { type: 'ERROR' }
  | { type: 'SET_MODAL' }
  | { type: 'FETCH_OFFERS'; offers: IOffer[] }
  | { type: 'SAVE_OFFER'; offers: IOffer[] }
  | { type: 'DELETE_OFFER'; offers: IOffer[] }
  | { type: 'SELECT_OFFER'; offer: IOffer }

export type ActionSettings =
  | { type: 'START_LOADING' }
  | { type: 'FINISH_LOADING' }
  | { type: 'ERROR' }
  | { type: 'UPDATE'; values: IGeneralSettings }
  | { type: 'FETCH_SETTINGS'; values: ISettingsState }
  | { type: 'FETCH_LIST'; values: string[] }
  | { type: 'SET_MODAL' }
  | { type: 'SET_ACTION'; typeAction: typeActionListOption }
  | { type: 'SET_TYPE_LIST'; typeList: typeList }
  | {
      type: 'UPDATE_COUNT_LIST'
      intBlackIp: number
      intBlackSignature: number
      intRemoteUrl: number
    }

export interface IDashboardState {
  interval: typeIntervalDashboard
  groups: string[]
  streams: string[]
  loading: boolean
  country: string[]
  ignoreBot: boolean
  hits: number
  uniques: number
  amount: number
  sales: number
  typeLines: typeChartLineDashboard
  stats: IStatsDashboard[]
  lastClick: ILastClick[]
  lastAmount: ILastAmount[]
  fetchDashboard: () => void
  updateValue: (menuDashboard: IMenuDashboardValues) => void
}

export type ActionDashboard =
  | { type: 'START_LOADING' }
  | { type: 'ERROR' }
  | {
      type: 'FETCH_DASHBOARD'
      stats: IStatsDashboard[]
      hits: number
      uniques: number
      sales: number
      amount: number
      lastClick: ILastClick[]
      lastAmount: ILastAmount[]
    }
  | { type: 'UPDATE'; menu: IMenuDashboardValues }

export interface IStats {
  hits: number
  uniques: number
  sales: number
  amount: number
  value: string
}

export interface IStatisticState {
  type: StatisticType
  groups: string[]
  streams: string[]
  startDate: Date
  endDate: Date
  loading: boolean
  country: string[]
  ignoreBot: boolean
  stats: IStats[]
  interval: typeInterval
  setType: (t: StatisticType) => void
  fetchStats: () => void
  startLoading: () => void
  updateLocalStorage: (menuStats: IMenuStatsValues) => void
}

export type ActionStatistic =
  | { type: 'START_LOADING' }
  | { type: 'SET_TYPE'; t: StatisticType }
  | { type: 'CLEAR_STATS' }
  | { type: 'FETCH_STATS'; stats: IStats[] }
  | { type: 'ERROR' }
  | { type: 'UPDATE_LOCAL_STORAGE'; menu: IMenuStatsValues }

export interface IGroupState {
  groups: IGroupValues[]
  loading: boolean
  group: IGroupValues | null
  streams: IStreamValues[]
  stream: IStreamValues | null
  filters: IFilterValues[]
  filter: IFilterValues | null
  error: string | null
  fetchGroups: () => void
  fetchGroup: (id: string) => void
  clearGroup: () => void
  clearStream: () => void
  addGroup: (group: IGroupValues) => void
  editGroup: (group: IGroupValues) => void
  removeGroup: () => void
  addStream: (stream: IStreamValues) => void
  findStream: (id: string) => void
  editStream: (stream: IStreamValues) => void
  removeStream: (id: string) => void
  addFilter: (filter: IFilterValues) => void
  updateFilters: (filters: IFilterValues[]) => void
  stateError: (msg: string) => void
  clearStateError: () => void
  sortedStreams: () => void
  updateStreams: (stream: IStreamValues) => void
  editPositionStreams: (streams: IStreamValues[]) => void
  clearFilters: () => void
  updateFilter: (filter: IFilterValues) => void
  findFilter: (position: number) => void
  editFilter: (filter: IFilterValues) => void
  editPositionFilters: (filters: IFilterValues[]) => void
  removeFilter: (id: number) => void
  saveEditGroup: () => void
}

export type ActionGroup =
  | { type: 'START_LOADING' }
  | { type: 'FETCH_GROUPS_SUCCESS'; groups: IGroupValues[] }
  | { type: 'FETCH_GROUP_SUCCESS'; group: IGroupValues }
  | { type: 'FETCH_STREAMS'; streams: IStreamValues[] }
  | { type: 'FIND_STREAM'; stream: IStreamValues }
  | { type: 'CLEAR_STREAM' }
  | { type: 'CLEAR_STREAMS' }
  | { type: 'CLEAR_GROUP' }
  | { type: 'ADD_GROUP'; group: IGroupValues }
  | { type: 'ADD_STREAM'; stream: IStreamValues }
  | { type: 'ERROR' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'EDIT_GROUP'; group: IGroupValues }
  | { type: 'EDIT_STREAM'; stream: IStreamValues }
  | { type: 'SORTED_STREAMS'; streams: IStreamValues[] }
  | { type: 'UPDATE_STREAMS'; streams: IStreamValues[] }
  | { type: 'EDIT_POSITION_STREAMS'; streams: IStreamValues[] }
  | { type: 'GET_FILTERS'; filters: IFilterValues[] }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'ADD_FILTER'; filter: IFilterValues }
  | {
      type: 'UPDATE_FILTERS'
      filters: IFilterValues[]
      streams: IStreamValues[]
    }
  | { type: 'CLEAR_FILTER' }
  | { type: 'UPDATE_FILTER'; filter: IFilterValues }
  | { type: 'EDIT_FILTER'; filters: IFilterValues[] }
  | { type: 'EDIT_POSITION_FILTERS'; filters: IFilterValues[] }
  | { type: 'REMOVE_FILTER'; filters: IFilterValues[] }
  | { type: 'SAVE_EDIT_GROUP' }
  | { type: 'REMOVE_STREAM'; streams: IStreamValues[] }
  | { type: 'REMOVE_GROUP'; groups: IGroupValues[] }
