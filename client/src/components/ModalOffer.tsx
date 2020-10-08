import React, { useState} from 'react'
import {IOffer, IOfferValue, typeDistributionOffer} from "../intrefaces/interface";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    TextField,
    Select
} from "@material-ui/core"
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles"
import DeleteIcon from '@material-ui/icons/Delete'
import {listDistribution} from "../utils/edit.utils"

interface IModalProps {
    offer: IOffer | null
    open: boolean
    onClose(): void
    onSave(value: IOffer): void
}

const useStyle = makeStyles((theme: Theme) =>
    createStyles({
        form: {
            minWidth: '260px',
            marginTop: theme.spacing(0),
            textAlign: 'center'
        },
        addButton: {
            margin: theme.spacing(2, 'auto', 2, 'auto')
        },
        offer: {
            padding: theme.spacing(1, 1, 0, 0),
        },
        divider: {
            margin: theme.spacing(2, 0, 0, 2)
        }
    })
)

export const ModalOffer: React.FC<IModalProps> = ({open, onClose, onSave, offer}) => {
    const classes = useStyle()
    const [name, setName] = useState<string>(offer && offer.name ? offer.name : '')
    const [select, setSelect] = useState<typeDistributionOffer>(offer && offer.type ? offer.type : 'split')
    const [isUsePercent, setIsUsePercent] = useState<boolean>(
        offer && offer.type
                    ? listDistribution.find(d => d.value === offer.type)!.isUsePercent
                    : true)
    const [fields, setFields] = useState<IOfferValue[]>(offer && offer.offers ? offer.offers : [{
        url: '',
        percent: 100
    }])

    const handleChangeInput = (i: number, event: any) => {
        const values: IOfferValue[] = [...fields]
        const {name, value} = event.target
        // @ts-ignore
        values[i][name] = value
        setFields(values)
    }

    const handleAddInput = () => {
        const values: IOfferValue[] = [...fields]
        values.push({
            url: '',
            percent: 100
        })
        setFields(values)
    }

    const handleRemoveInput = (i: number) => {
        const values: IOfferValue[] = [...fields]
        values.splice(i, 1)
        setFields(values)
    }

    const selectHandler = (event: React.ChangeEvent<{ value: unknown }>) => {
        const value = event.target.value as typeDistributionOffer
        setSelect(value)
        setIsUsePercent(listDistribution.find(d => d.value === value)!.isUsePercent)
    }

    const submitHandler = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        onSave({
            name,
            type: select,
            offers: fields
        })
    }

    return (
        <Dialog open={open} onClose={onClose} className={classes.form} aria-labelledby="form-offer">
            <DialogTitle id="form-stream">OFFER</DialogTitle>
            <form
                className={classes.form}
                onSubmit={submitHandler}
            >
                <DialogContent>
                    <Grid container
                          direction="row"
                          justify="space-between"
                          alignItems="center"
                          spacing={2}
                    >
                        <Grid item xs={12} sm={7}>
                            <TextField
                                fullWidth
                                required
                                id="name"
                                label="Input name offer"
                                name='name'
                                variant="outlined"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={5}>
                            <Select
                                native
                                fullWidth
                                variant="outlined"
                                value={select}
                                onChange={(event: React.ChangeEvent<{ value: unknown }>) => selectHandler(event)}
                                inputProps={{
                                    name: 'typeDistribution',
                                    id: 'typeDistribution',
                                }}
                            >
                                {listDistribution.map(option => (
                                    <option key={option.value} value={option.value}>{option.name}</option>
                                ))}
                            </Select>
                        </Grid>
                    </Grid>
                    <Divider className={classes.divider}/>
                    {fields.map((field, idx) => {
                        return (
                            <Grid key={`${field}-${idx}`}
                                  className={classes.offer}
                                  container
                                  direction='row'
                                  justify='space-between'
                                  alignItems='center'
                                  spacing={2}
                            >

                                <Grid item xs={12} sm={isUsePercent ? 9 : 11}>
                                    <TextField
                                        fullWidth
                                        required
                                        id="url"
                                        label="Input URL"
                                        name='url'
                                        variant="outlined"
                                        value={field.url}
                                        onChange={event => handleChangeInput(idx, event)}
                                    />
                                </Grid>

                                {isUsePercent && <Grid item xs={12} sm={2}>
                                    <TextField
                                        fullWidth
                                        type='number'
                                        id="percent"
                                        label="Percent"
                                        name='percent'
                                        variant="outlined"
                                        value={field.percent}
                                        onChange={event => handleChangeInput(idx, event)}
                                    />
                                </Grid>}

                                <Grid item xs={12} sm={1}>
                                    <IconButton
                                        aria-label="delete"
                                        onClick={() => handleRemoveInput(idx)}
                                    >
                                        <DeleteIcon/>
                                    </IconButton>
                                </Grid>
                            </Grid>
                        )
                    })}
                    <Grid item xs={6} className={classes.addButton}>
                        <Button type='button' fullWidth color='primary' onClick={() => handleAddInput()}
                                variant='contained'>
                            add url
                        </Button>
                    </Grid>
                </DialogContent>

                <DialogActions>
                    <Button
                        type='submit'
                        variant='contained'
                        color='primary'
                        fullWidth
                    >SAVE</Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

