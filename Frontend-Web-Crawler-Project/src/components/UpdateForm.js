import React from 'react'
import Dialog from '@material-ui/core/Dialog';
import {useState, useEffect} from 'react';
import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';
import { TextField, FormControl, FormControlLabel, Radio, RadioGroup, FormLabel } from '@material-ui/core';
import { Button } from '@material-ui/core';
import { red } from '@mui/material/colors';

export default function UpdateForm({ props, setUpdateWebsite }) {
    const [regex, setRegex] = useState('')
    const [periodicity, setPeriodicity] = useState('')
    const [active, setActive] = useState(true)
    
    const handleRegex = (event) => {
        setRegex(event.target.value)
    }

    const handlePeriodicity = (event) => {
        setPeriodicity(event.target.value)
    }

    const handleActive = (event) => {
        if (event.target.value === 'True') {
            setActive(true)
        }
        else {
            setActive(false)
        }
    }
    
    useEffect(() => {
        const words = props.tags.split(',')
        var tagsList = []
        words.forEach((word) => {
            if (word !== '') {
                word = word.trim();
                tagsList.push(word)
            }
        })
        setUpdateWebsite({identifier: props.identifier, url: props.url, regex: regex, active: active, periodicity: periodicity, label: props.label, tags: props.tags })
    }, [regex, periodicity, active])


    return (

        <>
            <TextField
                label="URL"
                margin="normal"
                fullWidth
                placeholder={props.url}
                inputProps={
                    { readOnly: true, }
                }
                color='secondary'
            />
            <TextField
                placeholder={props.label}
                label="Label"
                margin="normal"
                fullWidth
                inputProps={
                    { readOnly: true, }
                }
                color='secondary'
            />
            <br />
            <TextField
                placeholder={props.tags}
                label="Tags"
                margin="normal"
                fullWidth
                inputProps={
                    { readOnly: true, }
                }
                color='secondary'
            />
            <br />
            <TextField
                placeholder={props.regex}
                label="Regex"
                margin="normal"
                fullWidth
                onChange={handleRegex}

            />
            <br />
            <TextField
                placeholder={props.periodicity}
                label="Periodicity"
                margin="normal"
                fullWidth
                onChange={handlePeriodicity}
            />
            <br />
            <FormControl id="form-radio">
                <br />
                <FormLabel id="radio-buttonsl">Active/Inactive</FormLabel>
                <RadioGroup
                    aria-labelledby="radio-buttons"
                    defaultValue={props.active}
                    name="radio-buttons-group"
                    row
                    onChange={handleActive}
                >
                    <FormControlLabel value="True" control={<Radio color="primary" />} label="True" />
                    <FormControlLabel value="False" control={<Radio color="primary" />} label="False" />

                </RadioGroup>
            </FormControl>
            <br />
        </>

    )
}
