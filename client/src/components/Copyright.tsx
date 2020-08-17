import React from 'react';
import {Typography} from "@material-ui/core";

export const Copyright: React.FC = () => (
    <Typography variant="body2" color="textSecondary" align="center">
        {'Copyright © Whale\'s TDS '}
        {new Date().getFullYear()}
        {'.'}
    </Typography>
)
