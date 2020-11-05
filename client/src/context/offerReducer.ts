import { ActionOffer, IOfferState } from './types'

export const offerReducer = (
  state: IOfferState,
  action: ActionOffer,
) => {
  switch (action.type) {
    case 'START_LOADING':
      return { ...state, loading: true }
    case 'FINISH_LOADING':
      return { ...state, loading: false }
    case 'ERROR':
      return { ...state, loading: false }
    case 'SET_MODAL':
      if (state.modal) {
        return { ...state, modal: !state.modal, offer: null }
      } else {
        return { ...state, modal: !state.modal }
      }
    case 'FETCH_OFFERS':
      return { ...state, offers: action.offers, offer: null }
    case 'SAVE_OFFER':
      return { ...state, offers: action.offers, offer: null }
    case 'DELETE_OFFER':
      return { ...state, offers: action.offers, offer: null }
    case 'SELECT_OFFER':
      return { ...state, offer: action.offer }
    default:
      return state
  }
}
