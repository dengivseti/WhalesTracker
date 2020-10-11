import React, { useContext } from 'react'
import { StatisticContext } from '../context/StatisticState'
import { Grid, Typography } from '@material-ui/core'
import MUIDataTable from 'mui-datatables'
import FlagIconFactory from 'react-flag-icon-css'
import SmartphoneIcon from '@material-ui/icons/Smartphone'
import DesktopWindowsIcon from '@material-ui/icons/DesktopWindows'
import DevicesOtherIcon from '@material-ui/icons/DevicesOther'
import {
  createMuiTheme,
  createStyles,
  makeStyles,
  Theme,
  ThemeOptions,
  MuiThemeProvider,
} from '@material-ui/core/styles'
import { toCurrency } from '../utils/money.utils'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    table: {
      marginTop: theme.spacing(1),
    },
    flagContainer: {
      margin: '0px',
      padding: '0px',
    },
    flag: {
      fontSize: '1em',
      margin: '0px',
      padding: '0px',
    },
  }),
)

const overrides = {
  MUIDataTableBodyCell: {
    stackedCommon: {
      '@media (max-width:599.95px)': {
        height: '100%',
        padding: 0,
      },
    },
  },
  MuiTableCell: {
    root: {
      padding: '2px',
      paddingLeft: '1rem',
    },
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

export const TableStatistic: React.FC = () => {
  const classes = useStyles()
  const { stats, type, loading } = useContext(StatisticContext)
  const FlagIcon = FlagIconFactory(React, { useCssModules: false })

  const bodyValueRender = (value: string) => {
    switch (type) {
      case 'country':
        if (value.length > 7 || !value.length) {
          return ' '
        }
        try {
          return (
            <Grid
              container
              justify="flex-start"
              direction="row"
              className={classes.flagContainer}
            >
              <FlagIcon
                code={value.toLowerCase()}
                size={'lg'}
                className={classes.flag}
              />
              <>&nbsp;&nbsp;&nbsp;{value}</>
            </Grid>
          )
        } catch (e) {
          return (
            <Grid
              container
              justify="flex-start"
              direction="row"
              className={classes.flagContainer}
            >
              <>&nbsp;&nbsp;&nbsp;{value}</>
            </Grid>
          )
        }
      case 'device':
        switch (value) {
          case 'desktop':
            return <DesktopWindowsIcon />
          case 'mobile':
            return <SmartphoneIcon />
          case 'other':
            return <DevicesOtherIcon />
          default:
            return <DevicesOtherIcon />
        }
      default:
        return value
    }
  }
  if (loading) {
    return <></>
  }
  if (!stats.length && !loading) {
    return (
      <Typography align={'center'} variant={'h5'}>
        NO DATA STATS
      </Typography>
    )
  }
  const name =
    type.toString()[0].toUpperCase() + type.toString().slice(1)
  const columns = [
    {
      name,
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value: string) => {
          return bodyValueRender(value)
        },
      },
    },
    {
      name: 'Hits',
      option: {
        filter: true,
        sort: true,
      },
    },
    { name: 'Uniques' },
    { name: 'EPM' },
    { name: 'Sales' },
    { name: 'Amount' },
  ]
  let sortValue = stats
  if (type !== 'day') {
    sortValue = stats.sort((a: any, b: any) =>
      (a['hits'] as number) > (b['hits'] as number) ? -1 : 1,
    )
  }

  const epms = (amount: number, hits: number) => {
    const epm = amount / (hits / 1000)
    if (epm) {
      return epm.toFixed(1)
    }
    return 0
  }
  const data: Array<Array<string | number>> = []
  sortValue.forEach((s) => {
    const epm = epms(s.amount, s.hits)
    data.push([
      s.value,
      s.hits,
      s.uniques,
      epm,
      s.sales,
      toCurrency(s.amount),
    ])
  })

  const options = {
    filter: false,
    responsive: 'stacked' as const,
    selectableRows: 'none' as const,
    filterType: 'dropdown' as const,
    rowsPerPage: 500,
    rowsPerPageOptions: [25, 50, 100, 500],
    print: false,
    download: false,
  }

  return (
    <MuiThemeProvider theme={Themes}>
      <Grid className={classes.table}>
        <MUIDataTable
          title={''}
          data={data}
          columns={columns}
          options={options}
        />
      </Grid>
    </MuiThemeProvider>
  )
}
