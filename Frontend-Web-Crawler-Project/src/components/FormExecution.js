import React from 'react'

import { useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';
import { TextField, FormControl, FormControlLabel, Radio, RadioGroup, FormLabel } from '@material-ui/core';

import './FormWebsite.css'
export default function FormWebsite({ setAddExecution }) {
    const [url, setUrl] = useState('')
  
    const handleUrl = (event) => {
        setUrl(event.target.value)
    }


    useEffect(() => {
        setAddExecution({url: url})
    }, [url])
    
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
            </>
        </MuiThemeProvider>
    )
}
