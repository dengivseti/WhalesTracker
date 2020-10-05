import React, {useState} from 'react'
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from "@material-ui/core"
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles"
import {typeActionListOption} from "../intrefaces/interface"
import {Loader} from "./Loader"

interface IModalProps {
    open: boolean
    action: typeActionListOption
    list: string[]
    loading: boolean
    onClose(): void
    onSave(value: string[]): void
    }

const useStyle = makeStyles((theme: Theme) =>
    createStyles({
        form: {
            width: '100%',
            marginTop: theme.spacing(0),
            textAlign: 'center'
        },
        submit: {
            margin: theme.spacing(3, 0, 0),
        },
        textField: {
            minWidth: '400px'
        }
    })
)

export const ModalListOtherOption: React.FC<IModalProps> = ({open, onClose, onSave, loading, list, action}) => {
    const classes = useStyle()
    const [value, setValue] = useState<string>(list.join('\n'))

    const clickButtonHandler = () => {
        const editValue = value.split('\n')
        onSave(editValue)
    }

    if (loading) {
        return <Loader />
    }

    return (
        <>
            <Dialog open={open} onClose={onClose} className={classes.form}>
                <DialogTitle id="form-stream">{`List for ${action}`}</DialogTitle>
                <DialogContent>
                    <TextField
                        className={classes.textField}
                        multiline
                        rows={15}
                        defaultValue={value}
                        onChange={(event) => setValue(event.target.value)}
                        variant="outlined"
                    />
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
                        {action}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

