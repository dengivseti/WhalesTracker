import {IStatisticState, ActionStatistic} from "./types"


export const statisticReducer = (state: IStatisticState, action: ActionStatistic) => {
    switch (action.type){
        case 'START_LOADING':
            return {...state, stats: [], loading: true}
        case 'SET_TYPE':
            return {...state, type: action.t}
        case 'FETCH_STATS':
            return {...state, stats: action.stats, loading: false}
        case 'CLEAR_STATS':
            return {...state, stats: []}
        case 'ERROR':
            return {...state, loading: false, stats: []}
        case 'UPDATE_LOCAL_STORAGE':
            return {...state, ...action.menu}
        default :
            return state
    }
}