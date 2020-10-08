import React, {useContext, useEffect, useState} from 'react'
import {
    Button,
    Checkbox, Dialog, DialogActions,
    DialogContent,
    DialogTitle,
    FormControl, FormControlLabel, FormGroup, FormLabel,
    Grid,
    InputLabel, Select,
    TextField
} from "@material-ui/core"
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import {IValueTypeRedirect, listTypeRedirect} from "../utils/edit.utils";
import {GroupContext} from "../context/GroupState";
import {useMessage} from "../hooks/message.hook";
import {IStreamValues, typeRedirectValue} from "../intrefaces/interface";
import {FieldCode} from "./FieldCode";

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
    })
)

interface IModalProps {
    open: boolean
    onClose(): void
    onSave(): void
}

export const ModalStream: React.FC<IModalProps> = ({open, onClose, onSave}) => {
    const classes = useStyle()
    const {message} = useMessage()
    const {stream, error, clearStateError, streams, editStream, addStream, updateStreams} = useContext(GroupContext)
    const [relation, setRelation] = useState<boolean>(stream ? stream.relation : true)
    const [label, setLabel] = useState<string>(stream ? stream.name : '')
    const [typeRedirect, setTypeRedirect] = useState<typeRedirectValue>(stream ? stream.typeRedirect : 'httpRedirect')
    const [formFormTypeRedirect, setFormFormTypeRedirect] = useState<IValueTypeRedirect>(stream
        ? listTypeRedirect.find(t => t.value === stream.typeRedirect)!
        : listTypeRedirect[0]
    )
    const [code, setCode] = useState<string>(stream ? stream.code : '')
    const [isBot, setIsBot] = useState<boolean>(stream ? stream.isBot : false)
    const [isActive, setIsActive] = useState<boolean>(stream ? stream.isActive : true)
    const [useLog, setUseLog] = useState<boolean>(stream ? stream.useLog : true)
    const position = stream ? stream.position : streams.length + 1

    const clickSaveHandler = (event: React.MouseEvent) => {
        try{
            event.preventDefault()
            if (stream && !stream._id) {
                addStream(stream)
            }else{
                updateStreams(stream!)
            }
            onSave()
        }catch (e) {

        }
    }

    useEffect(() => {
        const form = listTypeRedirect.find(type => type.value === typeRedirect)!
        setFormFormTypeRedirect(form)
    }, [typeRedirect])

    useEffect(() => {
        const updateStream: IStreamValues = {
            name: label, code, isActive, isBot, position, relation, typeRedirect, useLog
        }
        editStream(updateStream)
    }, [relation, label, typeRedirect, code, isBot, isActive, useLog])

    useEffect(() => {
        if (error) {
            message(error)
            clearStateError()
        }
    }, [error, clearStateError, message])

    return (
        <Dialog open={open} onClose={onClose} className={classes.form} aria-labelledby="form-stream">
            <DialogTitle id="form-stream">{stream ? stream.name : 'NEW STREAM'}</DialogTitle>
            <DialogContent>
                <Grid className={classes.formControl}>
                    <TextField
                        size="small"
                        margin="dense"
                        required
                        fullWidth
                        label="Label"
                        name="label"
                        value={label}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setLabel(event.target.value)}
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
                <Grid container justify="space-between" >
                        <FormLabel className={classes.checkboxControl}>Filtering values relation</FormLabel>
                        <FormGroup row>
                            <FormControlLabel control={<Checkbox checked={relation} onChange={() => setRelation(!relation)} color="primary"/>} label="&&" />
                            <FormControlLabel control={<Checkbox checked={!relation} onChange={() => setRelation(!relation)} color="primary"/>} label="||" />
                        </FormGroup>
                </Grid>
                <Grid container justify="space-between"  >
                    <Grid item xs={4} sm={4}>
                        <FormControl>
                            <FormControlLabel
                                labelPlacement="bottom"
                                control={<Checkbox
                                    color="primary"
                                    checked={isBot}
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setIsBot(event.target.checked)}
                                />}
                                label="This bot stream"
                            />
                        </FormControl>
                    </Grid>
                    <Grid item xs={4} sm={4}>
                        <FormControl>
                            <FormControlLabel
                                labelPlacement="bottom"
                                control={<Checkbox
                                    color="primary"
                                    checked={isActive}
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setIsActive(event.target.checked)}
                                />}
                                label="Active"
                            />
                        </FormControl>
                    </Grid>
                    <Grid item xs={4} sm={4}>
                        <FormControl>
                            <FormControlLabel
                                labelPlacement="bottom"
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
                    onClick={clickSaveHandler}
                    color="primary"
                >SAVE</Button>
            </DialogActions>
        </Dialog>
    )
}