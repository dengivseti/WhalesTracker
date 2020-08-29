import React, {useContext} from 'react'
import {CardInfo} from "./CardInfo"
import {Grid} from "@material-ui/core"
import {makeStyles, Theme} from "@material-ui/core/styles"
import {DashboardContext} from "../context/DashboardState"

const useStyle = makeStyles((theme: Theme) => ({
    cards: {
        padding: theme.spacing(2, 0, 2, 0)
    },
}))

export const CardDashboard = () => {
    const classes = useStyle()
    const {amount, sales, uniques, hits, loading} = useContext(DashboardContext)
    return (
        <Grid
            container
            direction='row'
            justify='space-evenly'
            alignItems='center'
            spacing={2}
            className={classes.cards}
        >
            <Grid item xs={6} sm={3}>
                <CardInfo title='Hits' value={loading ? 0 : hits}/>
            </Grid>
            <Grid item xs={6} sm={3}>
                <CardInfo title='Uniques' value={loading ? 0 : uniques} />
            </Grid>
            <Grid item xs={6} sm={3}>
                <CardInfo title='Amount' value={loading ? 0 : amount}/>
            </Grid>
            <Grid item xs={6} sm={3}>
                <CardInfo title='Sales' value={loading ? 0 : sales}/>
            </Grid>
        </Grid>
    )
}
