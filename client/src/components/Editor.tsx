import React, { useContext } from 'react'
import {
  createStyles,
  makeStyles,
  Theme,
} from '@material-ui/core/styles'
import { Button, Divider, Grid, Paper } from '@material-ui/core'
import { EditGroup } from './EditGroup'
import { EditStreams } from './EditStreams'
import { EditFilters } from './EditFilters'
import { Loader } from './Loader'
import { GroupContext } from '../context/GroupState'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    paper: {
      padding: theme.spacing(2),
      height: '100%',
      textAlign: 'center',
      color: theme.palette.text.secondary,
    },
    divider: {
      marginBottom: '0.5rem',
      marginTop: '0.5rem',
    },
    submit: {
      margin: theme.spacing(3, 0, 0),
    },
  }),
)

interface ICreatePageProps {
  onSave: () => void
  onDelete: () => void
}

export const Editor: React.FC<ICreatePageProps> = ({
  onSave,
  onDelete,
}) => {
  const classes = useStyles()
  const { group, stream, loading } = useContext(GroupContext)

  const saveHandler = (event: React.MouseEvent) => {
    event.preventDefault()
    onSave()
  }

  const deleteHandler = (event: React.MouseEvent) => {
    event.preventDefault()
    onDelete()
  }

  return (
    <div className={classes.root}>
      <Grid container spacing={1}>
        <Grid item xs={12} sm={4}>
          <Paper className={classes.paper}>
            Group
            <Divider className={classes.divider} />
            {group ? <EditGroup /> : <Loader />}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              className={classes.submit}
              onClick={saveHandler}
            >
              Save
            </Button>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="default"
              disabled={loading}
              className={classes.submit}
              onClick={deleteHandler}
            >
              Delete
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper className={classes.paper}>
            Streams
            <Divider className={classes.divider} />
            <EditStreams />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={5}>
          <Paper className={classes.paper}>
            Filters
            <Divider className={classes.divider} />
            {stream ? (
              <EditFilters />
            ) : (
              <p>SELECT STREAM OR CREATE NEW</p>
            )}
          </Paper>
        </Grid>
      </Grid>
    </div>
  )
}
