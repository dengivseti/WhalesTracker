import React, {useContext, useEffect, useState} from 'react'
import {Fab, Grid} from "@material-ui/core"
import AddIcon from "@material-ui/icons/Add"
import {useStyles} from "../styles"
import {ModalGroup} from "../components/ModalGroup"
import {GroupContext} from "../context/GroupState"
import {Chart} from "../components/Chart"
import {DashboardContext} from "../context/DashboardState"
import {Loader} from "../components/Loader"
import {MenuDashboard} from "../components/MenuDashboard"
import {CardDashboard} from "../components/CardDashboard"
import {TableLastClick} from "../components/TableLastClick";
import {TableLastAmount} from "../components/TableLastAmount";

export const DashboardPage: React.FC = () => {
    const classes = useStyles()
    const {clearGroup} = useContext(GroupContext)
    const [openModal, setOpenModal] = useState<boolean>(false)
    const {loading, fetchDashboard, interval} = useContext(DashboardContext)

    const closeModalHandler = () => {
        setOpenModal(false)
    }

    useEffect(() => {
        clearGroup()
    }, [])

    useEffect(() => {
        fetchDashboard()
    }, [interval])

    return (
        <div>
            <CardDashboard/>
            <MenuDashboard/>
            <Grid container direction='row' >
                <Grid item xs={12}>
                    {loading ? <Loader/> : <Chart/>}
                </Grid>
            </Grid>
            <TableLastAmount />
            <TableLastClick />
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