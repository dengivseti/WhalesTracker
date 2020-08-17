import React, {useContext, useEffect, useState} from 'react'
import {Button, FormControl, Grid, InputLabel, Select} from '@material-ui/core'
import {StatisticContext} from "../context/StatisticState";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {GroupContext} from "../context/GroupState";
import {IStreamValues, typeInterval} from '../intrefaces/interface';
import DateFnsUtils from '@date-io/date-fns'
import {
    KeyboardDatePicker, MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import { intervalDate } from '../utils/edit.utils';
import {startOfMonth, subDays, subMonths, endOfMonth} from "date-fns";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        form: {
            width: '100%',
        },
        formControl: {
            minWidth: '140px',
        },
        datePicker: {
            maxWidth: '140px',
            margin: theme.spacing(0, 0, 1),
        },
        button: {
            margin: theme.spacing(2, 0, 0, 0),
            paddingRight: theme.spacing(2)
        }
    })
)

export const MenuStatistic: React.FC = () => {
    const currentDate = new Date()
    const day = 24*60*60*1000
    const classes = useStyles()
    const menu = useContext(StatisticContext)
    const [groupId, setGroupId] = useState<string>(menu.groups.length ? menu.groups[0] : ' ')
    const [streams, setStreams] = useState<IStreamValues[]>([])
    const [streamId, setStreamId] = useState<string>(menu.streams.length ? menu.streams[0] : ' ')
    const [dateStart, setDateStart] = useState<Date | null>(menu.startDate ? menu.startDate : new Date());
    const [dateEnd, setDateEnd] = useState<Date | null>(menu.endDate ? menu.endDate : new Date());
    const [interval, setInterval] = useState<typeInterval>(menu.interval ? menu.interval : 'today')
    const {groups} = useContext(GroupContext)

    useEffect(() => {
        const currentDate = new Date()
        switch (interval) {
            case 'today':
                setDateStart(currentDate)
                setDateEnd(currentDate)
                break
            case 'yesterday':
                setDateStart(subDays(currentDate, 1))
                setDateEnd(subDays(currentDate, 1))
                break
            case 'last3Day':
                setDateStart(subDays(currentDate, 2))
                setDateEnd(currentDate)
                break
            case 'last7Day':
                setDateStart(subDays(currentDate, 6))
                setDateEnd(currentDate)
                break
            case 'last14Day':
                setDateStart(subDays(currentDate, 13))
                setDateEnd(currentDate)
                break
            case 'thisMounth':
                setDateStart(startOfMonth(currentDate))
                setDateEnd(currentDate)
                break
            case 'lastMounth':
                const lastMonth = subMonths(currentDate, 1)
                setDateStart(startOfMonth(lastMonth))
                setDateEnd(endOfMonth(lastMonth))
                break
            default:
                setDateStart(currentDate)
                setDateEnd(currentDate)
        }
    }, [interval])

    useEffect(() => {
        if (dateEnd! > new Date()){
            setDateEnd(new Date())
        }
        console.log('dateEnd', dateEnd)
    }, [dateEnd])

    useEffect(() => {
        if (dateStart! > new Date()){
            setDateStart(new Date())
        }
    }, [dateStart])

    useEffect(() => {
        if (groupId !== ' ') {
            const group = groups.find(g => g._id === groupId)
            if (group) {
                setStreams(group.streams!)
            }
        } else {
            setStreams([])
        }
    }, [groupId])

    const intervalHandler = (event: React.ChangeEvent<{ value: unknown }>) => {
        setInterval(event.target.value as typeInterval)
    }

    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <Grid
                container
                direction="row"
                justify="space-between"
                alignItems="center"
                className={classes.form}
            >
                <Grid item className={classes.formControl}>
                    <FormControl className={classes.formControl}>
                        <InputLabel htmlFor="group">Group</InputLabel>
                        <Select
                            native
                            value={groupId}
                            onChange={(event: React.ChangeEvent<{ value: unknown }>) => setGroupId(event.target.value as string)}
                            inputProps={{
                                name: 'group'
                            }}
                        >
                            <option value={' '}>{'All'}</option>
                            {groups.map(option => (
                                <option key={option._id} value={option._id}>{option.label}</option>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item className={classes.formControl}>
                    <FormControl className={classes.formControl}>
                        <InputLabel htmlFor="streams">Stream</InputLabel>
                        <Select
                            native
                            value={streamId}
                            onChange={(event: React.ChangeEvent<{ value: unknown }>) => setStreamId(event.target.value as string)}
                            inputProps={{
                                name: 'streams'
                            }}
                        >
                            <option value={' '}>{'All'}</option>
                            {streams.map(option => (
                                <option key={option._id} value={option._id}>{option.name}</option>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item className={classes.datePicker}>
                    <KeyboardDatePicker
                        autoOk
                        variant="inline"
                        format="yyyy-MM-dd"
                        margin="normal"
                        label="Date Start"
                        value={dateStart}
                        onChange={setDateStart}
                        KeyboardButtonProps={{
                            'aria-label': 'change date',
                        }}
                    />
                </Grid>
                <Grid item className={classes.datePicker}>
                    <KeyboardDatePicker
                        autoOk
                        variant="inline"
                        format="yyyy-MM-dd"
                        margin="normal"
                        label="Date End"
                        value={dateEnd}
                        onChange={setDateEnd}
                        KeyboardButtonProps={{
                            'aria-label': 'change date',
                        }}
                    />
                </Grid>
                <Grid item className={classes.formControl}>
                    <FormControl className={classes.formControl}>
                        <InputLabel htmlFor="interval">Interval</InputLabel>
                        <Select
                            native
                            value={interval}
                            onChange={intervalHandler}
                            inputProps={{
                                name: 'interval'
                            }}
                        >
                            {intervalDate.map(interval => (
                                <option key={interval.value} value={interval.value}>{interval.name}</option>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item>
                    <Button className={classes.button}
                        // onClick={clickSaveHandler}
                            disabled={menu.loading}
                            variant="contained"
                            color="primary"
                    >Refresh</Button>
                </Grid>

            </Grid>
        </MuiPickersUtilsProvider>
    )
}