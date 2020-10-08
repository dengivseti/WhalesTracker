import React, {useContext, useEffect, useState} from 'react'
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {
    Select,
    TextField,
    InputLabel,
    FormControl,
    Checkbox,
    FormControlLabel, Grid
} from "@material-ui/core";
import {IValueTypeRedirect, listTypeRedirect} from "../utils/edit.utils";
import {GroupContext} from "../context/GroupState";
import {IGroupValues, typeRedirectValue} from "../intrefaces/interface";
import {FieldCode} from "./FieldCode";

const useStyle = makeStyles((theme: Theme) =>
    createStyles({
        form: {
            width: '100%',
            marginTop: theme.spacing(0)
        },
        formControl: {
            minWidth: '100%',
        },
        checkboxControl: {
            margin: theme.spacing(2, 0, 0),
        },
        selectEmpty: {
            marginTop: theme.spacing(1),
        },
    })
)

export const EditGroup: React.FC = () => {
    const classes = useStyle()
    const {group, editGroup} = useContext(GroupContext)
    const [label, setLabel] = useState<string>(group!.label)
    const [identifier, setIdentifier] = useState<string>(group!.name)
    const [typeRedirect, setTypeRedirect] = useState<typeRedirectValue>(group!.typeRedirect)
    const [formFormTypeRedirect, setFormFormTypeRedirect] = useState<IValueTypeRedirect>(listTypeRedirect.find(t => t.value === group!.typeRedirect)!)
    const [code, setCode] = useState<string>(group!.code)
    const [timeUnic, setTimeUnic] = useState<number>(group!.timeUnic)
    const [checkUnic, setCheckUniq] = useState<boolean>(group!.checkUnic)
    const [isActive, setIsActive] = useState<boolean>(group!.isActive)
    const [useLog, setUseLog] = useState<boolean>(group!.useLog)

    useEffect(() => {
        const updateGroup: IGroupValues = {
            label, name: identifier, typeRedirect, code, timeUnic, checkUnic, isActive, useLog
        }
        editGroup(updateGroup)
    }, [label, identifier, typeRedirect, code, timeUnic, checkUnic, isActive, useLog])

    useEffect(() => {
        const form = listTypeRedirect.find(type => type.value === typeRedirect)!
        setFormFormTypeRedirect(form)
    }, [typeRedirect])

    return (
        <form className={classes.form} noValidate>
            <Grid className={classes.formControl}>
                <TextField
                    size="small"
                    margin="dense"
                    required
                    fullWidth
                    id="label"
                    label="Label"
                    name="label"
                    value={label}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setLabel(event.target.value)}
                />
            </Grid>
            <Grid className={classes.formControl}>
                <TextField
                    size="small"
                    margin="dense"
                    required
                    fullWidth
                    id="identifier"
                    label="Identifier"
                    name="identifier"
                    value={identifier}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setIdentifier(event.target.value)}
                />
            </Grid>
            <Grid className={classes.formControl}>
                <FormControl className={classes.formControl}>
                    <InputLabel htmlFor="typeRedirect">Type redirect</InputLabel>
                    <Select
                        native
                        value={typeRedirect}
                        onChange={(event: React.ChangeEvent<{ value: unknown }>) => setTypeRedirect(event.target.value as typeRedirectValue)}
                        inputProps={{
                            name: 'typeRedirect',
                            id: 'typeRedirect',
                        }}
                    >
                        {listTypeRedirect.map(option => (
                            <option key={option.value} value={option.value}>{option.name}</option>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid className={classes.formControl}>
                <FieldCode type={formFormTypeRedirect.type}
                           description={formFormTypeRedirect.description}
                           value={code}
                           onChange={(value) => setCode(value)} />
            </Grid>
            <Grid container justify="space-between" direction="row-reverse">
                <Grid item xs={6} sm={6}>
                    <FormControl>
                        <TextField
                            size="small"
                            type="number"
                            margin="dense"
                            id="timeUnic"
                            label="Hour Unique"
                            name="timeUnic"
                            value={timeUnic}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setTimeUnic((Number(event.target.value)))}
                        />
                    </FormControl>
                </Grid>
                <Grid item xs={6} sm={6}>
                    <FormControl className={classes.checkboxControl}>
                        <FormControlLabel
                            control={<Checkbox
                                color="primary"
                                checked={checkUnic}
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setCheckUniq(event.target.checked)}
                            />}
                            label="Check unique"
                        />
                    </FormControl>
                </Grid>
            </Grid>
            <Grid container justify="space-between">
                <Grid item xs={6} sm={6}>
                    <FormControl>
                        <FormControlLabel
                            labelPlacement="start"
                            control={<Checkbox
                                color="primary"
                                checked={isActive}
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setIsActive(event.target.checked)}

                            />}
                            label="Active"
                        />
                    </FormControl>
                </Grid>
                <Grid item xs={6} sm={6}>
                    <FormControl>
                        <FormControlLabel
                            control={<Checkbox
                                color="primary"
                                checked={useLog}
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setUseLog(event.target.checked)}
                            />}
                            label="Logging"
                        />
                    </FormControl>
                </Grid>
            </Grid>
        </form>
    )
}