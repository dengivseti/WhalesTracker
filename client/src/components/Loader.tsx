import React from 'react';
import {CircularProgress} from "@material-ui/core";

export const Loader: React.FC = () => {
    return (
        <div style={{display: 'flex', justifyContent: 'center', marginTop: '50px'}}>
            <CircularProgress />
        </div>
    )
}