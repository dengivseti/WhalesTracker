import React, { useCallback, useContext, useEffect } from 'react'
import {
  AppBar,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  Toolbar,
  Typography,
} from '@material-ui/core'
import clsx from 'clsx'
import MenuIcon from '@material-ui/icons/Menu'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import { mainListItems } from './ListItemsDrawer'
import ListSubheader from '@material-ui/core/ListSubheader'
import { ListGroupDrawer } from './ListGroupDrawer'
import { Copyright } from './Copyright'
import { useStyles } from '../styles'
import { useTheme } from '@material-ui/core/styles'
import { AuthContext } from '../context/AuthContext'
import { GroupContext } from '../context/GroupState'

export const Layout: React.FC = (props) => {
  const classes = useStyles()
  const theme = useTheme()
  const { groups, fetchGroups } = useContext(GroupContext)
  const { isAuthenticated } = useContext(AuthContext)
  const [open, setOpen] = React.useState(false)
  // const [groups, setGroups] = useState<IGroupDrawer[]>([])
  // const {request} = useHttp()

  const handleDrawerOpen = () => {
    setOpen(true)
  }
  const handleDrawerClose = () => {
    setOpen(false)
  }

  const getGroups = useCallback(async () => {
    await fetchGroups()
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }
    getGroups()
  }, [isAuthenticated])

  return (
    <>
      <div className={classes.root}>
        <CssBaseline />
        <AppBar
          position="fixed"
          className={clsx(classes.appBar, {
            [classes.appBarShift]: open,
          })}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              className={clsx(
                classes.menuButton,
                open && classes.hide,
              )}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap>
              Whale's Tracker
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          className={classes.drawer}
          variant="persistent"
          anchor="left"
          open={open}
          classes={{
            paper: classes.drawerPaper,
          }}
        >
          <div className={classes.drawerHeader}>
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === 'ltr' ? (
                <ChevronLeftIcon />
              ) : (
                <ChevronRightIcon />
              )}
            </IconButton>
          </div>
          <Divider />
          <List>{mainListItems}</List>
          <Divider />
          <List>
            <ListSubheader inset>GROUPS</ListSubheader>
            <ListGroupDrawer groups={groups} />
          </List>
        </Drawer>
        <main
          className={clsx(classes.content, {
            [classes.contentShift]: open,
          })}
        >
          <div className={classes.drawerHeader} />
          {props.children}
          <Copyright />
        </main>
      </div>
    </>
  )
}
