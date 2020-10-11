import React, { useCallback, useContext, useEffect } from 'react'
import { Loader } from '../components/Loader'
import { useParams } from 'react-router-dom'
import { Editor } from '../components/Editor'
import { GroupContext } from '../context/GroupState'

interface RouteParams {
  id: string
}

export const EditPage: React.FC = () => {
  const { loading, fetchGroup, saveEditGroup } = useContext(
    GroupContext,
  )
  const params = useParams<RouteParams>()

  const getGroupInfo = useCallback(async () => {
    await fetchGroup(params.id)
  }, [params.id])

  const saveHandler = () => {
    saveEditGroup()
  }

  useEffect(() => {
    getGroupInfo()
  }, [params.id])

  if (loading) {
    return <Loader />
  }
  return (
    <>
      <Editor onSave={saveHandler} />
    </>
  )
}
