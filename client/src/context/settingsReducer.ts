import {ActionSettings, ISettingsState} from "./types";


export const settingsReduser = (state: ISettingsState, action: ActionSettings) => {
    switch (action.type) {
        case "START_LOADING":
            return {...state, loading: true}
        case "FINISH_LOADING":
            return {...state, loading: false}
        case "ERROR":
            return {...state, loading: false}
        case "UPDATE":
            return {...state, loading: false, general: action.values}
        case "FETCH_SETTINGS":
            const {general, intBlackIp, intBlackSignature, intRemoteUrl} = action.values
            return {...state, loading: false, general, intBlackIp, intBlackSignature, intRemoteUrl}
        case "FETCH_LIST":
            return  {...state, loading: false, list: action.values}
        case "SET_TYPE_LIST":
            return {...state, typeList: action.typeList}
        case "SET_MODAL":
            if (state.modal) {
                return {...state, modal: !state.modal, list: []}
            }else{
                return {...state, modal: !state.modal}
            }
        case "SET_ACTION":
            return {...state, action: action.typeAction}
        case "UPDATE_COUNT_LIST":
            return {...state,
                intRemoteUrl: action.intRemoteUrl,
                intBlackSignature: action.intBlackSignature,
                intBlackIp: action.intBlackIp}

    }
}