import React, {useContext} from 'react'
import {createMuiTheme, createStyles, makeStyles, MuiThemeProvider, Theme, ThemeOptions} from "@material-ui/core/styles"
import {DashboardContext} from "../context/DashboardState"
import {Grid} from "@material-ui/core"
import MUIDataTable from "mui-datatables"
import SmartphoneIcon from "@material-ui/icons/Smartphone"
import DesktopWindowsIcon from "@material-ui/icons/DesktopWindows"
import DevicesOtherIcon from "@material-ui/icons/DevicesOther"
import FlagIconFactory from 'react-flag-icon-css'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        table: {
            marginTop: '1rem'
        },
        flagContainer: {
            margin: '0px',
            padding: '0px'
        },
        flag: {
            fontSize: '1.5em',
            margin: '0px',
            padding: '0px'
        }
    })
)

const overrides = {
    MUIDataTableBodyCell: {
        stackedCommon: {
            '@media (max-width:599.95px)': {
                height: '100%',
                padding: 0,
            }
        },
    },
    MuiTableCell: {
        root: {
            padding: '2px',
            paddingLeft: '1rem',
        }
    },
}

const Themes = createMuiTheme({
    breakpoints: {
        values: {
            xs: 0,
            sm: 400,
            md: 600,
            lg: 1280,
            xl: 1920,
        },
    },
    overrides: overrides,
} as ThemeOptions)

export const TableLastClick: React.FC = () => {
    const classes = useStyles()
    const {loading, lastClick} = useContext(DashboardContext)
    const FlagIcon = FlagIconFactory(React, {useCssModules: false})

    const bodyCountry = (value: string) => {
        if (value.length > 7 || !value.length) {
            return ' '
        }
        try{
            return (
                <Grid container justify="flex-start" direction="row" className={classes.flagContainer}>
                    <FlagIcon code={value.toLowerCase()} size={'lg'} className={classes.flag}/>
                </Grid>
            )
        }catch (e) {
            return (
                <Grid container justify="flex-start" direction="row" className={classes.flagContainer}>
                    <>&nbsp;&nbsp;&nbsp;{value}</>
                </Grid>
            )
        }
    }

    const bodyDevice = (value: string) => {
        switch (value) {
            case 'desktop':
                return <DesktopWindowsIcon/>
            case 'mobile':
                return <SmartphoneIcon/>
            case 'other':
                return <DevicesOtherIcon/>
            default:
                return <DevicesOtherIcon/>
        }
    }
    const value = lastClick
    if (loading && !value.length) {
        return <></>
    }
    const columns = [
        {name: 'Time'},
        {
            name: 'Group',
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: 'Stream',
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: 'Device',
            options: {
                filter: true,
                sort: true,
                customBodyRender: (device: string) => bodyDevice(device)
            }
        },
        {
            name: 'Country',
            options: {
                filter: true,
                sort: true,
                customBodyRender: (value: string) => bodyCountry(value)
            }
        },
        {
            name: 'City',
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: 'Ip',
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: 'Useragent',
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: 'Unique',
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: 'Bot',
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: 'Out',
            options: {
                filter: true,
                sort: true,
            }
        }
    ]
    const data: Array<Array<string | number>> = []
    value.forEach(s => {
        data.push([
            s.date,
            s.group,
            s.stream,
            s.device,
            s.country,
            s.city,
            s.ip,
            s.useragent,
            s.unique ? '+' : '-',
            s.isBot ? '+' : '-',
            s.out
        ])
    })

    const options = {
        filter: false,
        responsive: 'stacked' as const,
        selectableRows: 'none' as const,
        filterType: 'dropdown' as const,
        rowsPerPage: 10,
        rowsPerPageOptions: [10, 25, 50, 100, 500],
        print: false,
        download: false,
    }

    return (
        <MuiThemeProvider theme={Themes}>
            <Grid className={classes.table}>
                <MUIDataTable
                    title={"Last Click"}
                    data={data}
                    columns={columns}
                    options={options}
                />
            </Grid>
        </MuiThemeProvider>
    )
}
