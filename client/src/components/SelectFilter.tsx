import React, { useContext, useEffect, useState } from 'react'
import {
  createStyles,
  makeStyles,
  Theme,
} from '@material-ui/core/styles'
import {
  Button,
  FormControl,
  Grid,
  InputLabel,
  Select,
} from '@material-ui/core'
import { InputFieldFilter } from './InputFieldFilter'
import { listFiltrs } from '../utils/edit.utils'
import { GroupContext } from '../context/GroupState'
import { typeFilter } from '../intrefaces/interface'

const useStyle = makeStyles((theme: Theme) =>
  createStyles({
    form: {
      width: '100%',
    },
    button: {
      marginTop: theme.spacing(2),
    },
  }),
)

export const SelectFilter: React.FC = () => {
  const classes = useStyle()
  const { filter, filters, addFilter, editFilter } = useContext(
    GroupContext,
  )
  const [disabledBtn, setDisabledBtn] = useState<boolean>(true)
  const [filterChange, setFilterChange] = useState<typeFilter | null>(
    filter ? filter.name : null,
  )
  const [filterValues, setFilterValues] = useState<
    string[] | boolean | null
  >(filter ? filter.action : null)

  useEffect(() => {
    if (typeof filterValues === 'boolean') {
      setDisabledBtn(false)
    } else if (Array.isArray(filterValues)) {
      if (filterValues.length) {
        setDisabledBtn(false)
      } else {
        setDisabledBtn(true)
      }
    } else if (filterChange === null) {
      setDisabledBtn(true)
    } else {
      setDisabledBtn(true)
    }
  }, [filterValues])

  useEffect(() => {
    if (filter) {
      setFilterChange(filter.name)
    } else {
      setFilterChange(null)
    }
  }, [filter])

  const optionFilter = () => {
    return listFiltrs.map((option) => (
      <option key={option.value} value={option.value}>
        {option.name}
      </option>
    ))
  }

  const changeHandler = (
    event: React.ChangeEvent<{ value: unknown }>,
  ) => {
    setFilterChange(event.target.value as typeFilter)
  }

  const filterHandler = (event: React.MouseEvent) => {
    event.preventDefault()
    if (!filterValues) {
      return
    }
    if (!filter) {
      addFilter({
        name: filterChange!,
        action: filterValues!,
        position: filters.length + 1,
      })
    } else {
      editFilter({
        name: filterChange!,
        action: filterValues!,
        position: filter.position,
      })
    }
    setFilterChange(null)
    setFilterValues(null)
  }

  const onValue = (item: string[] | boolean | null) => {
    setFilterValues(item)
  }

  return (
    <>
      <Grid container direction="column" alignContent="center">
        <FormControl className={classes.form}>
          <InputLabel htmlFor="typeFilter">Type filter</InputLabel>
          <Select
            id="typeFilter"
            value={filterChange ? filterChange : ''}
            onChange={changeHandler}
            native
            inputProps={{
              name: 'typeFilter',
            }}
          >
            <option value=''></option>
            {optionFilter()}
          </Select>
          <Grid item>
            <InputFieldFilter
              type={filterChange!}
              onValue={(item: string[] | boolean | null) =>
                onValue(item)
              }
            />
          </Grid>
          <Button
            className={classes.button}
            type="submit"
            fullWidth
            disabled={disabledBtn}
            variant="contained"
            color="primary"
            onClick={filterHandler}
          >
            {filter ? 'EDIT' : 'ADD'}
          </Button>
        </FormControl>
      </Grid>
    </>
  )
}
