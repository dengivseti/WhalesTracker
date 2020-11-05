import React from 'react'
import { Link } from 'react-router-dom'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Speed from '@material-ui/icons/Speed'
import EqualizerIcon from '@material-ui/icons/Equalizer'
import SettingsIcon from '@material-ui/icons/Settings'
import LocalOfferIcon from '@material-ui/icons/LocalOffer'
import Help from '@material-ui/icons/Help'

export const mainListItems = (
  <div>
    <ListItem button component={Link} to="/dashboard">
      <ListItemIcon>
        <Speed />
      </ListItemIcon>
      <ListItemText primary="Dashboard" />
    </ListItem>
    <ListItem button component={Link} to="/statistic">
      <ListItemIcon>
        <EqualizerIcon />
      </ListItemIcon>
      <ListItemText primary="Statistic" />
    </ListItem>
    <ListItem button component={Link} to="/offers">
      <ListItemIcon>
        <LocalOfferIcon />
      </ListItemIcon>
      <ListItemText primary="Offers" />
    </ListItem>
    <ListItem button component={Link} to="/settings">
      <ListItemIcon>
        <SettingsIcon />
      </ListItemIcon>
      <ListItemText primary="Settings" />
    </ListItem>
    <ListItem button component={Link} to="/information">
      <ListItemIcon>
        <Help />
      </ListItemIcon>
      <ListItemText primary="FAQ" />
    </ListItem>
  </div>
)
