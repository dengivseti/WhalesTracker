import {ActionSettings, ISettingsState} from "./types";


export const settingsReduser = (state: ISettingsState, action: ActionSettings) => {
    switch (action.type) {
        case "START_LOADING":
            return {...state, loading: true}
        case "ERROR":
            return {...state, loading: false}
        case "UPDATE":
            return {...state, loading: false, general: action.values}
        case "FETCH_SETTINGS":
            const {general, blackIp, blackSignature, remoteUrl} = action.values
            return {...state, loading: false, general, blackIp, blackSignature, remoteUrl}
    }
}