import React, {useContext, useEffect, useState} from 'react'
import {Fab} from "@material-ui/core"
import AddIcon from "@material-ui/icons/Add"
import {useStyles} from "../styles"
import {ModalGroup} from "../components/ModalGroup"
import {GroupContext} from "../context/GroupState"

export const DashboardPage: React.FC = () => {
    const classes = useStyles()
    const {clearGroup} = useContext(GroupContext)
    const [openModal, setOpenModal] = useState<boolean>(false)

    const closeModalHandler = () => {
        setOpenModal(false)
    }

    useEffect(() => {
        clearGroup()
    }, [])

    return (
        <div>
            <h1>Dashboard page</h1>
            {openModal && <ModalGroup open={openModal} onClose={closeModalHandler}/>}
            <Fab
                color="primary"
                onClick={() => setOpenModal(true)}
                className={classes.fab}
            >

                <AddIcon/>
            </Fab>
        </div>
    )
}