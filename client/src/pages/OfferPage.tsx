import React, { useContext, useEffect } from 'react'
import { ListOffers } from '../components/ListOffers'
import { OfferContex } from '../context/OfferState'
import { Loader } from '../components/Loader'

export const OfferPage: React.FC = () => {
  const { fetchOffer, loading } = useContext(OfferContex)

  useEffect(() => {
    fetchOffer()
  }, [])

  if (loading) {
    return <Loader />
  }

  return (
    <>
      <ListOffers />
    </>
  )
}
