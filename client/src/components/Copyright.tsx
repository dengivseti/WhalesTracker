import React from 'react';
import {Typography} from "@material-ui/core"
import {makeStyles, Theme} from "@material-ui/core/styles"

const useStyle = makeStyles((theme: Theme) => ({
    root: {
        padding: theme.spacing(5, 0, 2, 0)
    },
}))

export const Copyright: React.FC = () => {
    const classes = useStyle()

    return (
        <Typography variant="body2" color="textSecondary" align="center" className={classes.root}>
            {'Copyright © Whale\'s TDS '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    )
}
