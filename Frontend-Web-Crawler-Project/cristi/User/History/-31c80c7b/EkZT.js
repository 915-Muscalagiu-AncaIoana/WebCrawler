import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import { Dialog, Alert, AlertTitle } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import PrincipalMenu from "./PrincipalMenu";
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import { Button } from '@material-ui/core';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import './SearchAppBar.css'
import FormWebsite from './FormWebsite'
import SearchSelect from './SearchSelect'
import AddBoxIcon from '@mui/icons-material/AddBox';
import axios from 'axios';
import { useEffect } from 'react';
import RefreshIcon from '@mui/icons-material/Refresh';
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha';

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





export default function SearchAppBar({ setSelectedTab, setFilters, setWebsites, setPaginatedWebsites }) {
  const [state, setState] = React.useState({ modal: false, url: '', regex: '', periodicity: '', label: '', active: true, tags: [] });
  const [stateFilters, setStateFilters] = React.useState({ field: 'none', string: '' })
  const [addWebsite, setAddWebsite] = React.useState({ url: '', regex: '', periodicity: '', label: '', tags: [], active: true })
  const [flagToAdd, setFlagToAdd] = React.useState(false)
  const [openAlert, setOpenAlert] = React.useState(false);
  const [error, setError] = React.useState()
  const setFilterField = (event) => {
    setStateFilters((prevState) => ({ field: event, string: prevState.string }))
  }

  const toggleModal = () => {
    setState({
      modal: !state.modal
    })
  }


  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      console.log('do validate');
      setStateFilters((prevState) => ({ string: event.target.value, field: prevState.field }))
      setFilters({ field: stateFilters.field, string: stateFilters.string })
      console.log(stateFilters)
      axios.get('http://127.0.0.1:5000/website_records').then(
        res => {
          var prevWebsites = res.data
          if (stateFilters.field === 'url') {
            prevWebsites = prevWebsites.filter(website => website.url === event.target.value)
          }
          else if (stateFilters.field === 'label') {
            prevWebsites = prevWebsites.filter(website => website.label === event.target.value)
          }
          else if (stateFilters.field === 'tag') {

            var filteredWebsites = []
            prevWebsites.forEach(function (arrayItem) {
              const words = arrayItem.tags.split(',');
              var flag = false;
              words.forEach((word) => {
                if (word === event.target.value) {
                  flag = true
                }
              })
              if (flag) {
                filteredWebsites.push(arrayItem)
              }
            });
            prevWebsites = filteredWebsites
          }

          setWebsites(prevWebsites)
        }

      ).catch(err => {
        console.log(err);

      })


    }
  }

  const handleClick = () => {
    setOpenAlert(!openAlert);
  };

  const refreshWebsites = () => {
    axios.get('http://127.0.0.1:5000/website_records').then(
      res => {
        setWebsites(res.data)
      }

    ).catch(err => {
      console.log(err);

    })
  }

  const handleSubmit = (event) => {
    var er = 'Please fill'

    if (addWebsite.url === '') {
      er += ' Url,'
    }
    if (addWebsite.regex === '') {
      er += ' Regex,'
    }
    if (addWebsite.periodicity === '') {
      er += ' Periodicity,'
    }
    if (addWebsite.label === '') {
      er += ' Label,'
    }
    if (addWebsite.tags.length === 0) {
      er += ' Tags,'
    }
    console.log(addWebsite.tags);
    if (er === 'Please fill') {
      console.log(addWebsite);
      setFlagToAdd(true)
      return
    }
    setError(() => {
      er = er.slice(0, -1);
      er += ' field(s).'
      return er
    })
    setOpenAlert(true);
  }

  useEffect(() => {

    if (flagToAdd) {
      axios.post('http://127.0.0.1:5000/website', addWebsite).then(
        res => {
          axios.get('http://127.0.0.1:5000/website_records').then(
            res => {
              setWebsites(res.data)
              toggleModal();
            }

          ).catch(err => {
            console.log(err);
          })

          setFlagToAdd(false)
        }

      ).catch(err => {
        console.log(err);
        setFlagToAdd(false);
        if (err.response.status === 400){
          setError("Please input a valid periodicity format. hh:mm:ss")
        }
        else  if (err.response.status === 409){
          setError("Website with this url already exists.")
        }
        
        setOpenAlert(true)
      })

    }
  }, [flagToAdd])

  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <PrincipalMenu setSelectedTab={setSelectedTab} initialTab='1' />
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
          >
          </Typography>

          <IconButton id='refresh-button' onClick={refreshWebsites}>
            <RefreshIcon />
          </IconButton>

          <IconButton id='add-button' onClick={toggleModal}> <AddBoxIcon /> </IconButton>
          <Modal isOpen={state.modal} >
            <ModalHeader>Add New Website</ModalHeader>
            <ModalBody>
              <FormWebsite setAddWebsite={setAddWebsite} />
            </ModalBody>
            <ModalFooter>
              <Button color="success" onClick={handleSubmit}>submit</Button>
              <Button color="danger" onClick={toggleModal}>Cancel</Button>
            </ModalFooter>

          </Modal>

          
          <SearchSelect setString={setFilterField}></SearchSelect>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              onKeyDown={handleKeyDown}
              placeholder="Search…"
              inputProps={{ 'aria-label': 'search' }}
            />
          </Search>


          <Dialog open={openAlert} onClose={handleClick}>
            <Alert
              severity='error'
            >
              <AlertTitle>Error!</AlertTitle>
              {error}
            </Alert>
            <Button onClick={handleClick}>OK</Button>
          </Dialog>

        </Toolbar>
      </AppBar>
    </Box>
  );
}
