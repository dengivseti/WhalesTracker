import React, {useContext, useEffect, useState} from 'react'
import {
    Button,
    Checkbox, Dialog, DialogActions,
    DialogContent,
    DialogTitle,
    FormControl, FormControlLabel,
    Grid,
    InputLabel, Select,
    TextField
} from "@material-ui/core"
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {listTypeRedirect, IValueTypeRedirect} from "../utils/edit.utils";
import {generateId} from "../utils/generator.utils";
import {IGroupValues, typeRedirectValue} from "../intrefaces/interface";
import {useMessage} from "../hooks/message.hook";
import {GroupContext} from "../context/GroupState";
import { useHistory } from 'react-router-dom';

const useStyle = makeStyles((theme: Theme) =>
    createStyles({
        form: {
            width: '100%',
            marginTop: theme.spacing(0),
            textAlign: 'center'
        },
        formControl: {
            minWidth: '100%',
        },
        checkboxControl: {
            margin: theme.spacing(2, 0, 0),
        },
        submit: {
            margin: theme.spacing(3, 0, 0),
        },
    })
)

interface IModalProps {
    open: boolean
    onClose(): void
}

export const ModalGroup: React.FC<IModalProps> = ({open, onClose}) => {
    const classes = useStyle()
    const {message} = useMessage()
    const history = useHistory()
    const {error, clearStateError, addGroup, group} = useContext(GroupContext)
    const [label, setLabel] = useState<string>('')
    const randomIdentifier: string = generateId()
    const [identifier, setIdentifier] = useState<string>(randomIdentifier)
    const [typeRedirect, setTypeRedirect] = useState<typeRedirectValue>('httpRedirect')
    const [formFormTypeRedirect, setFormFormTypeRedirect] = useState<IValueTypeRedirect>(listTypeRedirect[0])
    const [code, setCode] = useState<string>('')
    const [timeUnic, setTimeUnic] = useState<number>(24)
    const [checkUnic, setCheckUniq] = useState<boolean>(false)
    const [isActive, setIsActive] = useState<boolean>(true)
    const [useLog, setUseLog] = useState<boolean>(true)

    useEffect(() => {
        if (error) {
            message(error)
            clearStateError()
        }
    }, [error, clearStateError, message])

    useEffect(() => {
        if(group && group!._id){
            history.push(`/group/${group!._id}`)
        }
    }, [group])



    const clickButtonHandler = async (event: React.MouseEvent) => {
        event.preventDefault()
        const createGroup: IGroupValues = {
            label, name: identifier, typeRedirect, code,
            timeUnic, useLog, checkUnic, isActive
        }
        await addGroup(createGroup)
    }

    useEffect(() => {
        const form = listTypeRedirect.find(type => type.value === typeRedirect)!
        setFormFormTypeRedirect(form)
    }, [typeRedirect])

    return (
        <Dialog open={open} onClose={onClose} className={classes.form} aria-labelledby="form-stream">
            <DialogTitle id="form-stream">CREATE GROUP</DialogTitle>
            <DialogContent>
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
                                <option
                                    key={option.value}
                                    value={option.value}
                                    >
                                    {option.name}
                                </option>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid className={classes.formControl}>
                    <TextField
                        size="small"
                        margin="dense"
                        fullWidth
                        id="code"
                        label={formFormTypeRedirect.description}
                        name="code"
                        disabled={!formFormTypeRedirect.disabled}
                        value={code}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setCode(event.target.value)}
                    />
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
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setTimeUnic(Number(event.target.value))}
                            />
                        </FormControl>
                    </Grid>
                    <Grid item xs={6} sm={6}>
                        <FormControl className={classes.checkboxControl}>
                            <FormControlLabel
                                control={<Checkbox
                                    color="primary"
                                    checked={checkUnic}
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setCheckUniq(event.target.checked)}/>}
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
            </DialogContent>
            <DialogActions>
                <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                    onClick={clickButtonHandler}
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    )
}