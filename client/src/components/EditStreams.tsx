import React, {useContext, useEffect, useState} from 'react'
import {SortableListStreams} from "./SortableListStreams";
import arrayMove from "array-move";
import {
    Button
} from "@material-ui/core"
import {ModalStream} from "./ModalStream";
import {GroupContext} from "../context/GroupState";

export const EditStreams: React.FC = () => {
    const [openModal, setOpenModal] = useState<boolean>(false)
    const {streams, findStream, clearStream, sortedStreams, editPositionStreams,removeStream, clearFilters} = useContext(GroupContext)
    const [items, setItems] = useState(streams);
    const [selected, setSelected] = useState<string>('')

    useEffect(() => {
        console.log('STREAMS:', streams)
        sortedStreams()
        setItems(streams)
    }, [streams])


    useEffect(() => {
        editPositionStreams(items)
    }, [items])

    const onSortEnd = (lstitem: any) => {
        setItems(arrayMove(items, lstitem.oldIndex, lstitem.newIndex));
    };

    const clickButton = () => {
        clearStream()
        clearFilters()
        setOpenModal(!openModal)
    }

    const editHandler = (value: string) => {
        console.log('USE EDIT', value)
        clearStream()
        setSelected(value)
        setOpenModal(true)
        findStream(value)
    }

    const clickHandler = (value: string) => {
        console.log('USE CLICK', value)
        clearStream()
        setSelected(value)
        findStream(value)
    }

    const removeHandler = (value: string) => {
        console.log('REMOVE', value)
        removeStream(value)
    }

    const closeModalHandler = () => {
        console.log('close modal')
        setOpenModal(false)
    }

    const saveStreamHandler = () => {
        console.log('save')
        setOpenModal(false)
    }


    return (
        <>
            <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                onClick={clickButton}
            >
                Add Stream
            </Button>
            {!streams
                ? <p>No streams</p>
                :<SortableListStreams
                    items={items}
                    onSortEnd={onSortEnd}
                    useDragHandle={true}
                    lockAxis="y"
                    onClicks={(value: any) => clickHandler(value)}
                    onRemove={(value: any) => removeHandler(value)}
                    onEdit={(value: any) => editHandler(value)}
                    selected={selected}
                />
            }
            {openModal && <ModalStream open={openModal} onClose={closeModalHandler} onSave={saveStreamHandler}/>}
        </>
    );

}