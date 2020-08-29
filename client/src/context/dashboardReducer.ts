import {ActionDashboard, IDashboardState} from "./types";


export const dashboardReducer = (state: IDashboardState, action: ActionDashboard) => {
    switch (action.type) {
        case "START_LOADING":
            return {...state, stats: [], loading: true}
        case "ERROR":
            return {...state, stats: [], loading: false}
        case "FETCH_DASHBOARD":
            return {...state,
                stats: action.stats,
                hits: action.hits,
                uniques: action.uniques,
                ales: action.sales,
                amount: action.amount,
                loading: false}
        case "UPDATE":
            return {...state, ...action.menu}
        default:
            return state
    }
}