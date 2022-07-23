import React from 'react'
import Dialog from '@material-ui/core/Dialog';
import {useState, useEffect} from 'react';
import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';
import { TextField, FormControl, FormControlLabel, Radio, RadioGroup, FormLabel } from '@material-ui/core';
import { Button } from '@material-ui/core';
import { red } from '@mui/material/colors';

export default function AddCrawledForm({ props, setAddWebsite }) {
    const [regex, setRegex] = useState('')
    const [periodicity, setPeriodicity] = useState('')
    const [active, setActive] = useState(true)
    const [label, setLabel] = useState('')
    const [tags, setTags] = useState('')
    
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

    const handleLabel = (event) => {
        setLabel(event.target.value)
    }

    const handleTags = (event) => {
        setTags(event.target.value)
    }
    
    useEffect(() => {
        if (tags){
        const words = tags.split(',')
        
        var tagsList = []
        words.forEach((word) => {
            if (word !== '') {
                word = word.trim();
                tagsList.push(word)
            }
        })
  
    }
        setAddWebsite({url: props.url, regex: regex, active: active, periodicity: periodicity, label: label, tags: tagsList })
    }, [regex, periodicity, active, label, tags])


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
                placeholder={label}
                label="Label"
                margin="normal"
                fullWidth
                onChange={handleLabel}
                color='primary'
                required
            />
            <br />
            <TextField
                placeholder={tags}
                label="Tags"
                margin="normal"
                fullWidth
                onChange={handleTags}
                color='primary'
                required
            />
            <br />
            <TextField
                placeholder={regex}
                label="Regex"
                margin="normal"
                fullWidth
                onChange={handleRegex}
                required

            />
            <br />
            <TextField
                placeholder={periodicity}
                label="Periodicity"
                margin="normal"
                fullWidth
                required
                onChange={handlePeriodicity}
            />
            <br />
            
        </>

    )
}
