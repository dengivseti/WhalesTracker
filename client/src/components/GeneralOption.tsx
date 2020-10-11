import React, { useContext, useState } from 'react'
import {
  Grid,
  Paper,
  FormControl,
  Input,
  FormHelperText,
  InputLabel,
  Select,
  Button,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import { createStyles, Theme } from '@material-ui/core/styles'
import { listTrashOption } from '../utils/edit.utils'
import { SettingsContext } from '../context/SettingsState'
import { Loader } from './Loader'
import { typeTrash } from '../intrefaces/interface'
import { IGeneralSettings } from '../context/types'

const useStyle = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      maxWidth: '600px',
      marginTop: theme.spacing(0),
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3),
      margin: 'auto',
    },
    button: {
      marginTop: theme.spacing(5),
      marginBottom: theme.spacing(2),
    },
  }),
)

export const GeneralOption: React.FC = () => {
  const classes = useStyle()
  const { general, loading, updateSettings } = useContext(
    SettingsContext,
  )
  const [postbackKey, setPostbackKey] = useState<string>(
    general && general.postbackKey ? general.postbackKey : '',
  )
  const [clearDayStatistic, setClearDayStatistic] = useState<number>(
    general && general.clearDayStatistic
      ? general.clearDayStatistic
      : 0,
  )
  const [trash, setTrash] = useState<typeTrash>(
    general && general.trash
      ? general.trash
      : listTrashOption[0].value,
  )
  const [trashUrl, setTrashUrl] = useState<string>(
    general && general.trashUrl ? general.trashUrl : '',
  )
  const [getKey, setGetKey] = useState<string>(
    general && general.getKey ? general.getKey : '',
  )
  const [logLimitClick, setLogLimitClick] = useState<number>(
    general && general.logLimitClick ? general.logLimitClick : 10,
  )
  const [logLimitAmount, setLogLimitAmount] = useState<number>(
    general && general.logLimitAmount ? general.logLimitAmount : 10,
  )
  const [clearRemote, setClearRemote] = useState<number>(
    general && general.clearRemote ? general.clearRemote : 0,
  )

  const saveHandler = () => {
    const value: IGeneralSettings = {
      postbackKey,
      clearDayStatistic: +clearDayStatistic,
      trash,
      trashUrl,
      logLimitClick: +logLimitClick,
      logLimitAmount: +logLimitAmount,
      getKey,
      clearRemote,
    }
    updateSettings({ ...value })
  }

  if (loading) {
    return <Loader />
  }

  return (
    <Paper className={classes.root}>
      <Grid
        container
        spacing={3}
        direction="column"
        justify="center"
        alignItems="stretch"
      >
        <Grid item>
          <FormControl fullWidth>
            <InputLabel htmlFor="postback">Postback</InputLabel>
            <Input
              id="postback"
              value={postbackKey}
              onChange={(event) => setPostbackKey(event.target.value)}
            />
            <FormHelperText id="postback-helper">
              Global postback key
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid item>
          <FormControl fullWidth>
            <InputLabel htmlFor="clearDayStatistic">
              Clear statistics days
            </InputLabel>
            <Input
              type="number"
              id="clearDayStatistic"
              value={clearDayStatistic}
              onChange={(event) =>
                setClearDayStatistic(+event.target.value)
              }
            />
            <FormHelperText id="clearDayStatistic-helper">
              How long save to store statistics?
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid item>
          <FormControl fullWidth>
            <InputLabel htmlFor="clearRemote">
              Clear remote days
            </InputLabel>
            <Input
              type="number"
              id="clearRemote"
              value={clearRemote}
              onChange={(event) =>
                setClearRemote(+event.target.value)
              }
            />
            <FormHelperText id="clearRemote-helper">
              How long save to store remote value?
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid item>
          <FormControl fullWidth>
            <InputLabel htmlFor="trash">Trash</InputLabel>
            <Select
              native
              inputProps={{
                name: 'trash',
                id: 'trash',
              }}
              value={trash}
              onChange={(
                event: React.ChangeEvent<{ value: unknown }>,
              ) => setTrash(event.target.value as typeTrash)}
            >
              {listTrashOption.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.name}
                </option>
              ))}
            </Select>
            <FormHelperText id="trash-helper">
              Where to send all other traffic
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid item>
          <FormControl fullWidth>
            <InputLabel htmlFor="trashUrl">Trash URL</InputLabel>
            <Input
              id="trashUrl"
              value={trashUrl}
              onChange={(event) => setTrashUrl(event.target.value)}
            />
            <FormHelperText id="trashUrl-helper">
              Link on trash
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid item>
          <FormControl fullWidth>
            <InputLabel htmlFor="getKey">Query key</InputLabel>
            <Input
              id="getKey"
              value={getKey}
              onChange={(event) => setGetKey(event.target.value)}
            />
            <FormHelperText id="getKey-helper">
              Name option GET query params keyword
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid item>
          <FormControl fullWidth>
            <InputLabel htmlFor="logLimitClick">
              Limit click
            </InputLabel>
            <Input
              type="number"
              id="logLimitClick"
              value={logLimitClick}
              onChange={(event) =>
                setLogLimitClick(+event.target.value)
              }
            />
            <FormHelperText id="logLimitClick-helper">
              How many show clicks on dashboard page statistic
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid item>
          <FormControl fullWidth>
            <InputLabel htmlFor="logLimitAmount">
              Limit amount
            </InputLabel>
            <Input
              type="number"
              id="logLimitAmount"
              value={logLimitAmount}
              onChange={(event) =>
                setLogLimitAmount(+event.target.value)
              }
            />
            <FormHelperText id="logLimitAmount-helper">
              How many show amounts on dashboard page statistic
            </FormHelperText>
          </FormControl>
        </Grid>
        <Button
          onClick={saveHandler}
          className={classes.button}
          fullWidth
          color="primary"
          variant="contained"
        >
          SAVE
        </Button>
      </Grid>
    </Paper>
  )
}
