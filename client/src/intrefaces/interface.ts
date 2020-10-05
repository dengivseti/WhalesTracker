import { TAB } from "../pages/StatisticPage"

export type typeRedirectValue = 'httpRedirect'
    | 'jsRedirect'
    | 'remote'
    | 'iframeRedirect'
    | 'jsSelection'
    | 'iframe'
    | 'javascript'
    | 'metaRefresh'
    | 'showHtml'
    | 'showText'
    | 'showJson'
    | '403'
    | '400'
    | '404'
    | '500'
    | 'end'

export type typeTrash = 'url' | 'notFound'

export type typeFilter = 'device'
    | 'countries'
    | 'botIpv6'
    | 'browsers'
    | 'os'
    | 'platforms'
    | 'cities'
    | 'langBrowsers'
    | 'uaIncludes'
    | 'referIncludes'
    | 'nullReffer'
    | 'nullUa'
    | 'maskIpv6'
    | 'useListBlackIps'
    | 'useListBotSignatures'

export type StatisticType = keyof typeof TAB

export type typeIntervalDashboard =
    | 'day'
    | 'week'

export type typeChartLineDashboard =
    | "hits"
    | "uniques"
    | "sales"
    | "amount"

export type typeInterval =
    | 'today'
    | 'yesterday'
    | 'last3Day'
    | 'last7Day'
    | 'last14Day'
    | 'thisWeek'
    | 'lastWeek'
    | 'thisMounth'
    | 'lastMounth'

export type typeList = 'blackIps' | 'blackSignatures' | 'listUrl'

export type typeActionListOption = 'edit' | 'add' | 'delete' | 'clear'

export interface typeArrayListOtherSettings {
    type: typeList,
    text: string,
}

export interface IMenuStatsValues {
    type: StatisticType
    ignoreBot: boolean
    startDate: Date
    endDate: Date
    interval: typeInterval
    country: string[]
    groups: string[]
    streams: string[]
}

export interface  IMenuDashboardValues {
    ignoreBot: boolean,
    interval: typeIntervalDashboard
    country: string[]
    groups: string[]
    streams: string[]
    typeLines: typeChartLineDashboard
}

export interface IGroupDrawer {
    _id: string
    label: string
}

export interface IFilterValues {
    name: typeFilter
    action: string[] | boolean
    position: number
}

export interface IGroupValues {
    _id?: string
    label: string
    name: string
    typeRedirect: typeRedirectValue
    checkUnic: boolean
    timeUnic: number
    code: string
    useLog: boolean
    isActive: boolean
    streams?: IStreamValues[]
}

export interface IStreamValues {
    _id?: string
    position: number
    name: string
    typeRedirect: typeRedirectValue
    code: string
    useLog: boolean
    isActive: boolean
    relation: boolean
    isBot: boolean
    filters?: IFilterValues[]
}