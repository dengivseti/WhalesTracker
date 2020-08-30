import React from 'react'
import {Card, CardContent, Divider, Typography} from '@material-ui/core'
import {makeStyles, Theme} from "@material-ui/core/styles"

interface ICard {
    title: string
    value: number | string
}

const useStyle = makeStyles((theme: Theme) => ({
    value: {
        paddingTop: theme.spacing(3)
    }
}))

export const CardInfo: React.FC<ICard> = ({title, value}) => {
    const classes = useStyle()

    return (
        <Card>
            <CardContent>
                <Typography align='center' component="h2" variant="h6" color="primary" gutterBottom>{title}</Typography>
                <Divider/>
                <Typography align='center' component="p" variant="h6" className={classes.value}>
                    {value}
                </Typography>
            </CardContent>
        </Card>
    )
}
