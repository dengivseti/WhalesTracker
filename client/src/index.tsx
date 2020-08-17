import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {BrowserRouter} from "react-router-dom";
import {SnackbarProvider} from "notistack";
import {ThemeProvider} from "@material-ui/core/styles";
import {Themes} from "./styles";

ReactDOM.render(
    <>
        <ThemeProvider theme={Themes}>
            <SnackbarProvider maxSnack={3} preventDuplicate={false}>
                <BrowserRouter>
                        <App/>
                </BrowserRouter>
            </SnackbarProvider>
        </ThemeProvider>
    </>,
    document.getElementById('root')
)
serviceWorker.unregister();
