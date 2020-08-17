import React from "react"
import {
    SortableContainer,
    SortableElement,
    SortableHandle
} from "react-sortable-hoc"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import DragHandleIcon from "@material-ui/icons/DragHandle"
import CloseIcon from '@material-ui/icons/Close';
import EditIcon from '@material-ui/icons/Edit';
import {IconButton} from "@material-ui/core";


const DragHandle = SortableHandle(() => (
        <DragHandleIcon />
))


const SortableItem = SortableElement(({value, clickHandler, clickRemove, clickEdit, selected}: any) => (
    <ListItem
        ContainerComponent="div"
        button onClick={() => clickHandler(value._id)}
        selected={selected === value._id}
    >
        <DragHandle />
        <ListItemText primary={value.name} />
        <IconButton color="primary" component="span" size="small" onClick={(event: React.MouseEvent) => {
            event.stopPropagation()
            clickEdit(value._id)
        }}>
            <EditIcon />
        </IconButton>
        <IconButton color="primary" component="span" size="small" onClick={(event: React.MouseEvent) => {
            event.stopPropagation()
            clickRemove(value._id)
        }}>
            <CloseIcon />
        </IconButton>
    </ListItem>
))



export const SortableListStreams = SortableContainer(({ items, onClicks, onRemove, onEdit, selected }: any,) => (
    <List component="div" dense={true}>
        {items.map((item:any, index:number) => (
            <SortableItem
                key={item._id + '000'}
                index={index}
                value={item}
                clickHandler={(value:any) => onClicks(value)}
                clickRemove={(value: any) => onRemove(value)}
                clickEdit={(value: any) => onEdit(value)}
                selected={selected}
            />
        ))}
    </List>
))




