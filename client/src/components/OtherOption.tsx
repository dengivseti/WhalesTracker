import React, { useContext } from 'react'
import {
  createStyles,
  Theme,
  makeStyles,
} from '@material-ui/core/styles'
import {
  List,
  Paper,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Typography,
  ButtonGroup,
} from '@material-ui/core'
import { SettingsContext } from '../context/SettingsState'
import {
  typeActionListOption,
  typeArrayListOtherSettings,
} from '../intrefaces/interface'
import { ModalListOtherOption } from './ModalListOtherOption'

const useStyle = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      maxWidth: '600px',
      minWidth: '450px',
      marginTop: theme.spacing(0),
      margin: 'auto',
    },
    button: {
      marginLeft: theme.spacing(5),
    },
  }),
)

export const OtherOption = () => {
  const classes = useStyle()
  const {
    intRemoteUrl,
    intBlackSignature,
    intBlackIp,
    loading,
    setTypeList,
    list,
    fetchList,
    modal,
    setModal,
    action,
    setAction,
    saveList,
    clearList,
  } = useContext(SettingsContext)

  const arrayList: typeArrayListOtherSettings[] = [
    { type: 'blackIps', text: `List black IP. Items: ${intBlackIp}` },
    {
      type: 'blackSignatures',
      text: `Black Signature. Items: ${intBlackSignature}`,
    },
    { type: 'listUrl', text: `Remote url. Items: ${intRemoteUrl}` },
  ]

  const clickHandler = async (
    array: typeArrayListOtherSettings,
    action: typeActionListOption,
  ) => {
    if (action === 'clear') {
      clearList(array.type)
      return
    }
    if (action === 'edit') {
      await fetchList(array.type)
    }
    setModal()
    setTypeList(array.type)
    setAction(action)
  }

  const closeModalHandler = () => {
    setModal()
  }

  const saveHandler = (value: string[]) => {
    saveList(value)
    setModal()
  }

  return (
    <Paper className={classes.root}>
      <List>
        {arrayList.map((array) => {
          return (
            <ListItem
              key={array.type}
              alignItems="flex-start"
              id={array.type}
            >
              <ListItemText
                primary={<Typography>{array.text}</Typography>}
              />
              <ListItemSecondaryAction>
                <ButtonGroup color="primary" size="small">
                  <Button onClick={() => clickHandler(array, 'edit')}>
                    Edit
                  </Button>
                  <Button onClick={() => clickHandler(array, 'add')}>
                    Add
                  </Button>
                  <Button
                    onClick={() => clickHandler(array, 'delete')}
                  >
                    Delete
                  </Button>
                  <Button
                    onClick={() => clickHandler(array, 'clear')}
                  >
                    Clear
                  </Button>
                </ButtonGroup>
              </ListItemSecondaryAction>
            </ListItem>
          )
        })}
      </List>
      {modal && (
        <ModalListOtherOption
          open={modal}
          onClose={closeModalHandler}
          onSave={saveHandler}
          list={list}
          action={action}
          loading={loading}
        />
      )}
    </Paper>
  )
}
