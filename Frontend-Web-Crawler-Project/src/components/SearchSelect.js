import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import { FormControl } from "@mui/material";
import FilterListIcon from '@mui/icons-material/FilterList';

const colorW = "white";
const colorB = '#1976D2';

const useStyles = makeStyles({
  formControl: {
    "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
      borderColor: colorB
    }
  },
  select: {
    "&:before": {
      borderColor: colorB
    },
    "&:after": {
      borderColor: colorB
    },
    "&:hover": {
      borderColor: colorB
    },
    color : colorW
  },
  icon: {
    fill: colorW
  }
});

export default function SearchSelect({setString}) {
  const classes = useStyles();
 const [searchType, setSearchType] = useState('none')
  return (
    <FormControl className={classes.formControl}>
    <Select
      className={classes.select}
      inputProps={{
        classes: {
          icon: classes.icon,
          root: classes.root
        }
      
      }}
      renderValue={(value) => {
        return (
          <FilterListIcon/>
        );
      }}
      MenuProps={{
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "left"
        },
        transformOrigin: {
          vertical: "top",
          horizontal: "left"
        },
        getContentAnchorEl: null
      }}
      value={searchType}
      label="Search By"
      onChange={(event) => {setSearchType(event.target.value); setString(event.target.value)}}
    >
      <MenuItem value={'none'}>No Filter</MenuItem>
      <MenuItem value={'url'}>URL</MenuItem>
      <MenuItem value={'label'}>Label</MenuItem>
      <MenuItem value={'tag'}>Tag</MenuItem>
    </Select>
    </FormControl>
  );
}

