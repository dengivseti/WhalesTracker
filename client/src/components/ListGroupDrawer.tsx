import React from 'react'
import ListItem from '@material-ui/core/ListItem'
import { Link } from 'react-router-dom'
import ListItemText from '@material-ui/core/ListItemText'
import { IGroupDrawer } from '../intrefaces/interface'

type ListGroupDrawer = {
  groups: IGroupDrawer[] | any
}

export const ListGroupDrawer: React.FC<ListGroupDrawer> = ({
  groups,
}) => {
  return groups.map((group: IGroupDrawer) => {
    return (
      <ListItem
        key={group._id}
        button
        component={Link}
        to={`/group/${group._id}`}
      >
        <ListItemText inset primary={group.label} />
      </ListItem>
    )
  })
}
