import React, { useContext, useEffect, useState } from 'react'
import { DashboardContext } from '../context/DashboardState'
import {
  IStreamValues,
  typeIntervalDashboard,
  typeChartLineDashboard,
} from '../intrefaces/interface'
import { GroupContext } from '../context/GroupState'
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  Select,
} from '@material-ui/core'
import { makeStyles, Theme } from '@material-ui/core/styles'
import {
  intervalDashboard,
  linesChartDashboard,
} from '../utils/edit.utils'

const useStyle = makeStyles((theme: Theme) => ({
  form: {
    padding: theme.spacing(2, 0, 2, 0),
    width: '100%',
  },
  formControl: {
    minWidth: '140px',
  },
  checkboxControl: {
    margin: theme.spacing(2, 0, 0),
  },
  button: {
    margin: theme.spacing(2, 0, 0, 0),
    paddingRight: theme.spacing(2),
  },
}))

export const MenuDashboard: React.FC = () => {
  const classes = useStyle()
  const menu = useContext(DashboardContext)
  const { groups } = useContext(GroupContext)
  const [groupId, setGroupId] = useState<string>(
    menu.groups.length ? menu.groups[0] : '',
  )
  const [streams, setStreams] = useState<IStreamValues[]>([])
  const [streamId, setStreamId] = useState<string>(
    menu.streams.length ? menu.streams[0] : '',
  )
  const [interval, setInterval] = useState<typeIntervalDashboard>(
    menu.interval ? menu.interval : 'day',
  )
  const [ignoreBot, setIgnoreBot] = useState<boolean>(menu.ignoreBot)
  const [typeLines, setTypeLines] = useState<typeChartLineDashboard>(
    menu.typeLines ? menu.typeLines : 'hits',
  )

  useEffect(() => {
    if (groupId !== '') {
      const group = groups.find((g) => g._id === groupId)
      if (group) {
        setStreams(group.streams!)
      }
    } else {
      setStreams([])
    }
  }, [groupId, groups])

  useEffect(() => {
    menu.updateValue({
      ignoreBot: ignoreBot,
      streams: [streamId],
      groups: [groupId],
      country: [],
      typeLines,
      interval,
    })
  }, [groupId, streamId, interval, ignoreBot, typeLines])

  const selectGroupHandler = (
    event: React.ChangeEvent<{ value: unknown }>,
  ) => {
    if (event.target.value !== '') {
      setGroupId(event.target.value as string)
    } else {
      setGroupId('' as string)
    }
    setStreamId('' as string)
  }

  const selectStreamHandler = (
    event: React.ChangeEvent<{ value: unknown }>,
  ) => {
    if (event.target.value !== '') {
      setStreamId(event.target.value as string)
    } else {
      setStreamId('' as string)
    }
  }

  const lineTypeHandler = (
    event: React.ChangeEvent<{ value: unknown }>,
  ) => {
    setTypeLines(event.target.value as typeChartLineDashboard)
  }

  const intervalHandler = (
    event: React.ChangeEvent<{ value: unknown }>,
  ) => {
    setInterval(event.target.value as typeIntervalDashboard)
  }

  const clickHandler = () => {
    menu.fetchDashboard()
  }

  return (
    <Grid
      container
      direction="row"
      justify="space-between"
      alignItems="stretch"
      className={classes.form}
    >
      <Grid item>
        <FormControl className={classes.formControl}>
          <InputLabel htmlFor="group" shrink={true}>
            Group
          </InputLabel>
          <Select
            native
            value={groupId}
            onChange={(e) => selectGroupHandler(e)}
            inputProps={{
              name: 'group',
            }}
          >
            <option value={''}>{'All'}</option>
            {groups.map((option) => (
              <option key={option._id} value={option._id}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item>
        <FormControl className={classes.formControl}>
          <InputLabel htmlFor="streams" shrink={true}>
            Stream
          </InputLabel>
          <Select
            native
            value={streamId}
            onChange={(e) => selectStreamHandler(e)}
            inputProps={{
              name: 'streams',
            }}
          >
            <option value={''}>{'All'}</option>
            {streams.map((option) => (
              <option key={option._id} value={option._id}>
                {option.name}
              </option>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item>
        <FormControl className={classes.checkboxControl}>
          <FormControlLabel
            labelPlacement="start"
            control={
              <Checkbox
                color="primary"
                checked={ignoreBot}
                onChange={(
                  event: React.ChangeEvent<HTMLInputElement>,
                ) => setIgnoreBot(event.target.checked)}
              />
            }
            label="Ignore bot"
          />
        </FormControl>
      </Grid>

      <Grid item>
        <FormControl className={classes.formControl}>
          <InputLabel htmlFor="Type">Type</InputLabel>
          <Select
            native
            value={typeLines}
            onChange={lineTypeHandler}
            inputProps={{
              name: 'type',
            }}
          >
            {linesChartDashboard.map((interval) => (
              <option key={interval.value} value={interval.value}>
                {interval.name}
              </option>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item>
        <FormControl className={classes.formControl}>
          <InputLabel htmlFor="interval">Interval</InputLabel>
          <Select
            native
            value={interval}
            onChange={intervalHandler}
            inputProps={{
              name: 'interval',
            }}
          >
            {intervalDashboard.map((interval) => (
              <option key={interval.value} value={interval.value}>
                {interval.name}
              </option>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={1}>
        <Button
          className={classes.button}
          fullWidth={true}
          onClick={clickHandler}
          disabled={menu.loading}
          variant="contained"
          color="primary"
        >
          Refresh
        </Button>
      </Grid>
    </Grid>
  )
}
