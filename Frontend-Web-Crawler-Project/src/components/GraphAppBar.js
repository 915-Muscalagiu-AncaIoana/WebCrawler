import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import { Dialog, Alert, AlertTitle, ListItemButton } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import PrincipalMenu from "./PrincipalMenu";
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import { List, ListItem, ListItemText, Checkbox, ListItemIcon } from '@mui/material';
import axios from 'axios';
import { Button } from '@material-ui/core';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import './GraphAppBar.css'
import FilterListIcon from '@mui/icons-material/FilterList';
import {useInterval} from 'usehooks-ts';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      '&:focus': {
        width: '20ch',
      },
    },
  },
}));





export default function GraphAppBar({ setSelectedTab, setParentWebsites }) {
  const [stateFilters, setStateFilters] = React.useState({ field: 'none', string: '' })
  const [websites, setWebsites] = React.useState([]);
  
  const [openAlert, setOpenAlert] = React.useState(false);
  const [openModal, setOpenModal] = React.useState(false);
  const [error, setError] = React.useState()
  const [checked, setChecked] = React.useState([]);
  
  
  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];
    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    setChecked(newChecked);
  };
  React.useEffect(() => {
    axios.get('http://127.0.0.1:5000/website_records').then(
      res => {
        const filtered = res.data.filter(website => website.active);
        setWebsites(filtered)
      }

    ).catch(err => {
      console.log(err);
    })
  }, [])
  useInterval(()=>{
    if (!openModal){
    axios.get('http://127.0.0.1:5000/website_records').then(
      res => {
        const filtered = res.data.filter(website => website.active);
        setWebsites(filtered)
      }

    ).catch(err => {
      console.log(err);
    })
  }
  },30000)

  React.useEffect(()=>{
    const displayedWebsites = []
    
    var i = 0;
    for (i = 0; i< websites.length;i++){
     
      if (checked.indexOf(i) === -1){
        displayedWebsites.push(websites[i])
      }
    }
    
    setParentWebsites(displayedWebsites)
  },[websites])

  const handleClick = () => {
    setOpenAlert(!openAlert);
  };

  const handleSubmit = () => {
    setOpenModal(false);
    const displayedWebsites = []
    var i = 0;
    
    for (i = 0; i< websites.length;i++){
      
      if (checked.indexOf(i) === -1){
        displayedWebsites.push(websites[i])
      }
    }
    
    setParentWebsites(displayedWebsites)
  }

  const toggleModal = () => {
    setOpenModal((prevModal) => !prevModal)
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <PrincipalMenu setSelectedTab={setSelectedTab} initialTab='3' />
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
          >
          </Typography>

          <IconButton id='filter-button' onClick={toggleModal}>
            <FilterListIcon />
          </IconButton>



          <Dialog open={openAlert} onClose={handleClick}>
            <Alert
              severity='error'
            >
              <AlertTitle>Error!</AlertTitle>
              {error}
            </Alert>
            <Button onClick={handleClick}>OK</Button>
          </Dialog>


          <Modal isOpen={openModal} >
            <ModalHeader>Choose Website Records</ModalHeader>
            <ModalBody>
              <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                {
                websites.map((value) => {
                  const labelId = value.url
                  const counter = websites.indexOf(value)
                  return (
                    <ListItem
                      key={counter}
                      disablePadding
                    >
                      <ListItemButton role={undefined} onClick={handleToggle(counter)} dense>
                        <ListItemIcon>
                          <Checkbox
                            edge="start"
                            checked={ checked.indexOf(counter) === -1}
                            tabIndex={-1}
                            disableRipple
                          />
                        </ListItemIcon>
                        <ListItemText primary={labelId} />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </ModalBody>
            <ModalFooter>
              <Button color="success" onClick={handleSubmit}>submit</Button>
              <Button color="danger" onClick={toggleModal}>Cancel</Button>
            </ModalFooter>

          </Modal>

        </Toolbar>
      </AppBar>
    </Box>
  );
}
