import React, { createContext, useEffect, useReducer } from 'react'
import { IOfferState } from './types'
import { useHttp } from '../hooks/http.hook'
import { useMessage } from '../hooks/message.hook'
import { offerReducer } from './offerReducer'
import { IOffer } from '../intrefaces/interface'

function noop() {}

const initialState: IOfferState = {
  loading: false,
  offers: [],
  offer: null,
  modal: false,
  fetchOffer: noop,
  setModal: noop,
  saveOffer: noop,
  deleteOffer: noop,
  selectOffer: noop,
}

export const OfferContex = createContext<IOfferState>(initialState)

export const OfferState: React.FC = ({ children }) => {
  const { request, error, clearError } = useHttp()
  const { message } = useMessage()
  const [state, dispatch] = useReducer(offerReducer, initialState)

  useEffect(() => {
    if (error) {
      message(error)
      clearError()
    }
  }, [error, clearError, message])

  const fetchOffer = async () => {
    startLoading()
    try {
      const data = await request('/api/info/offers')
      if (data) {
        dispatch({
          type: 'FETCH_OFFERS',
          offers: data,
        })
      }
      finishLoading()
    } catch (e) {
      offerError()
    }
  }

  const saveOffer = async (offer: IOffer) => {
    startLoading()
    try {
      let offers: IOffer[] = []
      const response = await request(
        `/api/edit/offers/edit`,
        'POST',
        { ...offer },
      )
      if (response) {
        if (offer && offer._id) {
          state.offers.forEach((o) => {
            if (o._id !== offer._id) {
              offers.push(o)
            }
          })
        } else {
          offers = [...state.offers]
        }
        const newOffers = [...offers, { ...response }]
        dispatch({ type: 'SAVE_OFFER', offers: newOffers })
      }
      finishLoading()
    } catch (e) {
      offerError()
    }
  }

  const selectOffer = async (offer: IOffer) => {
    await dispatch({ type: 'SELECT_OFFER', offer })
    setModal()
  }

  const deleteOffer = async (id: string) => {
    startLoading()
    try {
      const response = await request(
        `api/edit/offers/${id}`,
        'DELETE',
      )
      if (response) {
        const offers: IOffer[] = []
        state.offers.forEach((offer) => {
          if (offer._id !== id) {
            offers.push(offer)
          }
        })
        dispatch({ type: 'DELETE_OFFER', offers: [...offers] })
      }
      finishLoading()
    } catch (e) {
      offerError()
    }
  }

  const setModal = () => {
    dispatch({ type: 'SET_MODAL' })
  }

  const startLoading = () => {
    dispatch({ type: 'START_LOADING' })
  }

  const offerError = () => {
    dispatch({ type: 'ERROR' })
  }

  const finishLoading = () => {
    dispatch({ type: 'FINISH_LOADING' })
  }

  return (
    <OfferContex.Provider
      value={{
        loading: state.loading,
        offers: state.offers,
        offer: state.offer,
        modal: state.modal,
        fetchOffer,
        saveOffer,
        setModal,
        deleteOffer,
        selectOffer,
      }}
    >
      {children}
    </OfferContex.Provider>
  )
}
