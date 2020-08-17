import React, {useState, useEffect, useContext} from 'react'
import {listFiltrs} from "../utils/edit.utils";
import {Checkbox, FormControl, FormControlLabel, TextField} from "@material-ui/core";
import {Autocomplete} from "@material-ui/lab";
import ChipInput from 'material-ui-chip-input'
import {GroupContext} from "../context/GroupState";

interface IValuesProps {
    type: string
    onValue: (item: string[] | boolean | null) => void
}


export const InputFieldFilter: React.FC<IValuesProps> = ({type, onValue}) => {
    const {filter} = useContext(GroupContext)
    const [checked, setChecked] = useState<boolean>(true)
    const [arrItems, setArrItems] = useState<any[]>([])
    const [values, setValues] = useState<any[]>([])

    useEffect(() => {
        setArrItems([])
        setValues([])
        setChecked(false)
    }, [type])

    useEffect(() => {
        if (filter) {
            const obj = (listFiltrs.find(str => str.value === filter.name)!)
            if (obj.type === 1) {
                setChecked(filter.action as boolean)
            }else if (obj.type === 2) {
                const items: any[] = [];
                (filter.action as string[]).forEach(action => {
                    items.push(obj.valueObj!.find(f => f.value === action))
                })
                setArrItems(filter.action as string[])
                setValues(items)
            }else{
                setArrItems(filter.action as string[])
            }
        }
    }, [type])

    useEffect(() => {
        onValue(arrItems)
    }, [arrItems])

    useEffect(() => {
        onValue(checked)
    }, [checked])

    const chipsChanged = (chip: any[]) => {
        setArrItems(chip)
    }

    const arrItemChanged = (value: any) => {
        const arrPureItems: any[] = []
        const items: any[] = []
        value.forEach((item: any) => {
            arrPureItems.push(item.value)
            items.push(item)
            }
        )
        setArrItems(arrPureItems)
        setValues(items)
    }

    if (!type) {
        return (
            <p>Select type filter</p>
        )
    }

    const filterObj = listFiltrs.find(str => str.value === type)!
    if (!filterObj) {
        return (
            <p>Select another filter</p>
        )
    }

    switch (filterObj.type) {
        case 1:
            return (
                <FormControl>
                    <FormControlLabel
                        control={<Checkbox color="primary"/>}
                        label={filterObj.name}
                        checked={checked}
                        onChange={() => setChecked(!checked)}
                        // disabled={true}
                    />
                </FormControl>
            )
        case 2:
            return (
                <Autocomplete
                    multiple
                    onChange={(event, value) => arrItemChanged(value)}
                    id={filterObj.name}
                    options={filterObj.valueObj!}
                    value={values}
                    getOptionLabel={(option) => option.name}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            variant="standard"
                            label={filterObj.name}
                            placeholder={filterObj.name}
                        />
                    )}
                />
            )
        case 3:
            return (
                <ChipInput
                    defaultValue={arrItems}
                    clearInputValueOnChange={true}
                    fullWidth
                    // value={arrItems}
                    label={filterObj.name}
                    placeholder={filterObj.name}
                    onChange={(chip) =>  chipsChanged(chip)}
                />
            )
    }

    return (
        <div>
            <p>{type}</p>
        </div>
    )
}