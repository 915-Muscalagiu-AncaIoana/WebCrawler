import React from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Checkbox } from '@mui/material';
import { ThemeProvider, createTheme } from "@material-ui/core/styles";
import { deepPurple, amber, orange } from '@mui/material/colors';
import { useEffect } from 'react';
const colorW = 'white';
const colorB = '#1976D2';


export default function PrincipalMenu({setSelectedTab,initialTab}) {
    const [value, setValue] = React.useState(initialTab);

    const handleChange = (event, newValue) => {
        setValue(newValue);
        setSelectedTab(newValue);
    };

    useEffect(()=> {
     console.log('Tab :')
     console.log(initialTab)
    },[])

    return (

        <Tabs
        TabIndicatorProps={{
            style: {
              backgroundColor: "#ffffff",
              color: '#ffffff'
             }
            }}
            textColor='inherit'
            value={value}
            onChange={handleChange}
            aria-label="wrapped label tabs example"
            sx={{
                color: colorW, 
                
            }
            }
        >
            <Tab value="1" label="Websites" sx={{ color: colorW }} />
            <Tab value="2" label="Executions" sx={{ color: colorW }} />
            <Tab value="3" label="Links Graph" sx={{ color: colorW }} />
        </Tabs >


    );
}
