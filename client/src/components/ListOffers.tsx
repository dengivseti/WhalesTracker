import React, {useContext} from 'react'
import {
    Button,
    List,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Paper,
    ListItem,
    Typography
} from "@material-ui/core"
import {ModalOffer} from "./ModalOffer"
import {IOffer} from "../intrefaces/interface"
import {OfferContex} from "../context/OfferState"
import {Loader} from "./Loader"
import DeleteIcon from "@material-ui/icons/Delete"
import {makeStyles, Theme} from "@material-ui/core/styles"

const useStyle = makeStyles((theme: Theme) =>
    ({
        list: {
            margin: theme.spacing(2, 0, 2,0)
        }
    })
)

export const ListOffers = () => {
    const classes = useStyle()
    const {saveOffer, offers, loading, deleteOffer, selectOffer, offer, modal, setModal} = useContext(OfferContex)

    const saveHandler = (value: IOffer) => {
        if (offer) {
            const data = {...offer, ...value}
            saveOffer(data)
        } else {
            saveOffer(value)
        }
        setModal()
    }

    const handleDelete = (id: string) => {
        deleteOffer(id)
    }

    const clickHandler = (offer: IOffer) => {
        selectOffer(offer)
    }

    if (loading) {
        return <Loader/>
    }

    return (
        <>
            {offers.length &&
                <Paper>
                    <List className={classes.list}>
                        {offers.map((offer: IOffer) => (
                            <ListItem
                                button
                                key={offer._id}
                                onClick={() => clickHandler(offer)}
                            >
                                <ListItemText
                                    primary={
                                        <Typography >
                                            {`${offer.name} - ${offer.offers.length} url. Distribution: ${offer.type}`}
                                        </Typography>}/>
                                <ListItemSecondaryAction>
                                    <IconButton
                                        aria-label="delete"
                                        onClick={() => handleDelete(offer._id!)}
                                    >
                                        <DeleteIcon/>
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>

                        ))}
                    </List>
                </Paper>
            }
            <Button
                variant='contained'
                color='primary'
                onClick = {() => setModal()}
                fullWidth>Add Offer</Button>
            {modal && <ModalOffer open={modal} onClose={() => setModal()} onSave={saveHandler} offer={offer}/>}
        </>
    )
}

