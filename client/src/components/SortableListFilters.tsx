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
import {IconButton} from "@material-ui/core";
import { listFiltrs } from "../utils/edit.utils"


const DragHandle = SortableHandle(() => (
    <DragHandleIcon />
))


const SortableItem = SortableElement(({value, clickHandler, clickRemove, selected}: any) => (
    <ListItem
        ContainerComponent="div"
        button onClick={() => clickHandler(value.position)}
        selected={selected === value.position}
    >
        <DragHandle />
        <ListItemText primary={(listFiltrs.find(f => f.value === value.name))!.name} />
        <IconButton color="primary" component="span" size="small" onClick={(event: React.MouseEvent) => {
            event.stopPropagation()
            clickRemove(value.position)
        }}>
            <CloseIcon />
        </IconButton>
    </ListItem>
))



export const SortableListFilters = SortableContainer(({ items, onClicks, onRemove, selected}: any) => (
    <List component="div" dense={true}>
        {items.map((item:any, index:number) => (
            <SortableItem
                key={item.position}
                index={index}
                value={item}
                clickHandler={(value:any) => onClicks(value)}
                clickRemove={(value: any) => onRemove(value)}
                selected={selected}
            />
        ))}
    </List>
))




