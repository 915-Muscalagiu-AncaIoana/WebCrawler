import React from 'react'
import Dialog from '@material-ui/core/Dialog';
import { useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';
import { TextField, FormControl, FormControlLabel, Radio, RadioGroup, FormLabel } from '@material-ui/core';
import { Button } from '@material-ui/core';
import './FormWebsite.css'
export default function FormWebsite({ setAddWebsite }) {
    const [url, setUrl] = useState('')
    const [regex, setRegex] = useState('')
    const [periodicity, setPeriodicity] = useState('')
    const [label, setLabel] = useState('')
    const [tags, setTags] = useState('')
    const [active, setActive] = useState(true)
    const handleUrl = (event) => {
        setUrl(event.target.value)
    }
    const handleRegex = (event) => {
        setRegex(event.target.value)

    }

    const handlePeriodicity = (event) => {
        setPeriodicity(event.target.value)
    }

    const handleLabel = (event) => {
        setLabel(event.target.value)
    }

    const handleTags = (event) => {
        setTags(event.target.value)
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
        const words = tags.split(',')
        var tagsList = []
        words.forEach((word) => {
            if (word !== '') {
                word = word.trim();
                tagsList.push(word)
            }
        })
        setAddWebsite({ url: url, regex: regex, active: active, periodicity: periodicity, label: label, tags: tagsList })
    }, [url, regex, periodicity, active, tags, label])
    
    return (
        <MuiThemeProvider>
            <>
                <TextField
                    placeholder="Enter Website Url"
                    label="URL"
                    margin="normal"
                    fullWidth
                    required
                    onChange={handleUrl}
                />
                <br />
                <TextField
                    placeholder="Enter Boundary Regexp"
                    label="Regex"
                    margin="normal"
                    fullWidth
                    required
                    onChange={handleRegex}
                />
                <br />
                <TextField
                    placeholder="Enter Periodicity Crawl"
                    label="Periodicity"
                    margin="normal"
                    fullWidth
                    required
                    onChange={handlePeriodicity}
                />
                <br />
                <FormControl id="form-radio" >
                    <br />
                    <FormLabel id="radio-buttonsl">Active/Inactive</FormLabel>
                    <RadioGroup
                        aria-labelledby="radio-buttons"
                        defaultValue="True"
                        name="radio-buttons-group"
                        row
                        onChange={handleActive}
                    >
                        <FormControlLabel value="True" control={<Radio color="primary" />} label="True" />
                        <FormControlLabel value="False" control={<Radio color="primary" />} label="False" />

                    </RadioGroup>
                </FormControl>
                <br />
                <TextField
                    placeholder="Enter Website Label"
                    label="Label"
                    margin="normal"
                    fullWidth
                    required
                    onChange={handleLabel}
                />
                <br />
                <TextField
                    placeholder="Enter Tags"
                    label="Tags"
                    margin="normal"
                    fullWidth
                    required
                    onChange={handleTags}
                />
                <br />
            </>
        </MuiThemeProvider>
    )
}
