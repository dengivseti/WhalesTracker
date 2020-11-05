import React, { useContext, useEffect } from 'react'
import { fieldTypeRedirect } from '../intrefaces/interface'
import {
  Button,
  TextField,
  Typography,
  Select,
  InputLabel,
  FormControl,
} from '@material-ui/core'
import { OfferContex } from '../context/OfferState'
import { Loader } from './Loader'

interface IFieldProps {
  type: fieldTypeRedirect
  value: string
  description: string

  onChange(value: string): void
}

export const FieldCode: React.FC<IFieldProps> = (props) => {
  const { value, type, onChange, description } = props

  const { loading, fetchOffer, offers } = useContext(OfferContex)

  useEffect(() => {
    if (type === 'select') {
      fetchOffer()
    }
  }, [type])

  useEffect(() => {
    if (offers.length > 0 && type === 'select') {
      onChange(offers[0]._id!)
    }
  }, [offers])

  if (loading) {
    return <Loader />
  }

  if (type === 'textInput') {
    return (
      <TextField
        size="small"
        margin="dense"
        fullWidth
        id="code"
        label={description}
        name="code"
        value={value}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          onChange(event.target.value)
        }
      />
    )
  }

  if (type === 'select') {
    if (!offers.length) {
      return (
        <Typography style={{ margin: '2rem' }}>
          Add offer on{' '}
          {
            <Button href="/offers" variant="text">
              Offer Page
            </Button>
          }
        </Typography>
      )
    }
    return (
      <FormControl fullWidth>
        <InputLabel htmlFor="code">{description}</InputLabel>
        <Select
          native
          fullWidth
          value={value}
          onChange={(event: React.ChangeEvent<{ value: unknown }>) =>
            onChange(event.target.value as string)
          }
          inputProps={{
            name: 'code',
          }}
        >
          {offers.map((offer) => (
            <option key={offer._id} value={offer._id}>
              {offer.name}
            </option>
          ))}
        </Select>
      </FormControl>
    )
  }

  return <></>
}
