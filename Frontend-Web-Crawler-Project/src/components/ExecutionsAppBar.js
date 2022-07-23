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
import FormExecution from './FormExecution'
import AddBoxIcon from '@mui/icons-material/AddBox';
import axios from 'axios';
import { useEffect } from 'react';
import RefreshIcon from '@mui/icons-material/Refresh';

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





export default function ExecutionsAppBar({ setSelectedTab, setExecutions }) {
  const [state, setState] = React.useState({ modal: false, url: '', regex: '', periodicity: '', label: '', active: true, tags: [] });

  const [addExecution, setAddExecution] = React.useState({ url: ''})
  const [flagToAdd, setFlagToAdd] = React.useState(false)
  const [openAlert, setOpenAlert] = React.useState(false);
  const [error, setError] = React.useState()
  

  const toggleModal = () => {
    setState({
      modal: !state.modal
    })
  }


  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      console.log('do validate');
      axios.get('http://127.0.0.1:5000/executions').then(
        res => {
        var prevExecutions = res.data
        prevExecutions = prevExecutions.filter(execution => execution.label === event.target.value)
       setExecutions(prevExecutions)  
      }

      ).catch(err => {
        console.log(err);

      })


    }
  }

  const handleClick = () => {
    setOpenAlert(!openAlert);
  };

  const refreshExecutions = () => {
    axios.get('http://127.0.0.1:5000/executions').then(
      res => {
        setExecutions(res.data)
      }

    ).catch(err => {
      console.log(err);

    })
  }

  const handleSubmit = (event) => {
    var er = 'Please fill'
    
    if (addExecution.url === '') {
      er += ' Url '
    }

    if (er === 'Please fill') {
      console.log(addExecution);
      setFlagToAdd(true)
      return
    }
    setError(() => {
      er += ' field.'
      return er
    })
    setOpenAlert(true);
  }

  useEffect(() => {

    if (flagToAdd) {
      axios.post('http://127.0.0.1:5000/execution/empty', addExecution).then(
        res => {
          axios.get('http://127.0.0.1:5000/executions').then(
            res => {
              setExecutions(res.data)
              toggleModal()
            }

          ).catch(err => {
            console.log(err);
           
          })

          setFlagToAdd(false)
        }

      ).catch(err => {
        console.log(err);
        setFlagToAdd(false)
        if (err.response.status === 409){
            setError("Please input the url of an existing website.")
          }
          setOpenAlert(true)
      })

    }
  }, [flagToAdd])

  
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <PrincipalMenu setSelectedTab={setSelectedTab} initialTab='2' />
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
          >
          </Typography>

          <IconButton id='refresh-button' onClick={refreshExecutions}>
            <RefreshIcon />
          </IconButton>

          <IconButton id='add-button' onClick={toggleModal}> <AddBoxIcon /> </IconButton>
          <Modal isOpen={state.modal} >
            <ModalHeader>Add New execution</ModalHeader>
            <ModalBody>
              <FormExecution setAddExecution={setAddExecution} />
            </ModalBody>
            <ModalFooter>
              <Button color="success" onClick={handleSubmit}>submit</Button>
              <Button color="danger" onClick={toggleModal}>Cancel</Button>
            </ModalFooter>

          </Modal>

          
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
