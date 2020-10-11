import React, { useContext, useEffect, useState } from 'react'
import { SelectFilter } from './SelectFilter'
import { Divider } from '@material-ui/core'
import { GroupContext } from '../context/GroupState'
import { SortableListFilters } from './SortableListFilters'
import arrayMove from 'array-move'

export const EditFilters: React.FC = () => {
  const {
    filter,
    filters,
    findFilter,
    stream,
    updateFilters,
    editPositionFilters,
    removeFilter,
  } = useContext(GroupContext)
  const [items, setItems] = useState(filters)
  const [selected, setSelected] = useState<number | null>(null)

  useEffect(() => {
    if (!filter) {
      setSelected(null)
    }
  }, [filter])

  useEffect(() => {
    setItems(filters)
  }, [filters.length])

  useEffect(() => {
    if (stream) {
      updateFilters(filters)
    }
  }, [filters])

  useEffect(() => {
    editPositionFilters(items)
  }, [items])

  const onSortEnd = (lstitem: any) => {
    setItems(arrayMove(items, lstitem.oldIndex, lstitem.newIndex))
  }

  const clickHandler = (value: number) => {
    setSelected(value)
    findFilter(value)
  }

  const removeHandler = (value: number) => {
    removeFilter(value)
  }
  return (
    <>
      <SelectFilter />
      <Divider />
      {filters.length ? (
        <SortableListFilters
          items={filters}
          onSortEnd={onSortEnd}
          useDragHandle={true}
          lockAxis="y"
          onClicks={(value: any) => clickHandler(value)}
          onRemove={(value: any) => removeHandler(value)}
          selected={selected}
        />
      ) : (
        <p>NO FILTERS</p>
      )}
    </>
  )
}
