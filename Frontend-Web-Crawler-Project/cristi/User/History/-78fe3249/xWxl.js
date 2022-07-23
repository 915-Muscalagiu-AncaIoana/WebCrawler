import { Button, Table } from 'reactstrap';
import React, { useState, useEffect } from 'react'
import './App.css';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import axios from 'axios';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import _ from 'lodash';
import SearchAppBar from './components/SearchAppBar'
import UpdateForm from './components/UpdateForm';
import ExecutionsAppBar from './components/ExecutionsAppBar';
import GraphPage from './components/GraphPage';
import {useInterval} from 'usehooks-ts';

function App() {
  const[orderWebsites, setOrderWebsites] = useState("ASC")
  const [sortedBy, setSOrtedBy] = useState("time")
  const sortingWebsites = (col) => {
    var sorted= [...websites]
    if (orderWebsites === "ASC") {     
      if (col === 'time'){
        setSOrtedBy("time")
        sorted = sorted.sort((a,b)=> {
          const date_a = new Date(a.time)
          const date_b = new Date(b.time)
          if ( a === "N/A" && b === "N/A"){
            return 1;
          }
          else if ( a === "N/A"){
            return 1;
          }
          else if ( b === "N/A") {
            return -1;
          }
          return date_a < date_b ? 1 : -1;
        })
      }
      else {
        setSOrtedBy("url")
        sorted = sorted.sort((a,b)=> {
          return a.url < b.url ? 1 : -1;
        })
      }
    setOrderWebsites("DESC");
    }
    else {
      if (col === 'time'){
        setSOrtedBy("time")
        sorted = sorted.sort((a,b)=> {
          if ( a === "N/A" && b === "N/A"){
            return 1;
          }
          else if ( a === "N/A"){
            return -1;
          }
          else if ( b === "N/A") {
            return 1
          }
          
          const date_a = new Date(a.time)
          const date_b = new Date(b.time)
          return date_a > date_b ? 1 : -1;
        })
      }
      else {
        setSOrtedBy("url")
        sorted = sorted.sort((a,b)=> {
          return a.url > b.url ? 1 : -1;
        })
      }
      setOrderWebsites("ASC");
    }
    setWebsites(sorted)
  }
  
  const [state, setState] = useState({ modal: false, url: '', regex: '', periodicity: '', label: '', active: true, tags: [] });
  const pageSize = 10;
  const [websites, setWebsites] = useState([]);
  const [paginatedWebsites, setPaginatedWebsites] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageExecutions, setCurrentPageExecutions] = useState(1);
  const [selectedTab, setSelectedTab] = useState('1')
  const [filters, setFilters] = useState({ field: 'none', string: '' })
  const [executions, setExecutions] = useState([]);
 
  const pageSizeExecution = 10;

  const [paginatedExecutions, setPaginatedExecutions] = useState([]);
  const pageExecutionCount = executions ? Math.ceil(executions.length / pageSizeExecution) : 0;
  const pagesExecution = _.range(1, pageExecutionCount + 1);
  
  useInterval(()=>{
    axios.get('http://127.0.0.1:5000/website_records').then(
      res => {
        setWebsites(res.data)
        setPaginatedWebsites(_(res.data).slice(0).take(pageSize).value())
      
      }

    ).catch(err => {
      console.log(err);
    })
  },60000)

  useInterval(()=>{
    axios.get('http://127.0.0.1:5000/executions').then(
      res => {
        setExecutions(res.data)
        setPaginatedExecutions(_(res.data).slice(0).take(pageSize).value())
      }

    ).catch(err => {
      console.log(err);
    })
  },5000)

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/website_records').then(
      res => {
        setWebsites(res.data)
        setPaginatedWebsites(_(res.data).slice(0).take(pageSize).value())
      }

    ).catch(err => {
      console.log(err);
    })
  }, [])

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/executions').then(
      res => {
        setExecutions(res.data)
        setPaginatedExecutions(_(res.data).slice(0).take(pageSize).value())
      }

    ).catch(err => {
      console.log(err);
    })
  }, [])

  const pageCount = websites ? Math.ceil(websites.length / pageSize) : 0;
  const pages = _.range(1, pageCount + 1);

  const onHeaderCLick = () => {
    return {
      onClick: () => {
        console.log('CLICKED HEADER')
      }
    }
  }
  const handleSubmit = (event) => {
    setUpdateFlag(true);
    setState({ modal: !state.modal })
  }

  const toggleModalAndUpdate = (website) => {
    setUpdateWebsite(website)
    console.log('pressed update')
    setState({ modal: !state.modal })
  }

  const toggleModal = (website) => {
    setState({ modal: !state.modal })
  }
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
  const [deleteWebsite, setDeleteWebsite] = React.useState({});
  const [updateWebsite, setUpdateWebsite] = React.useState({ url: '', regex: '' });
  const [updateFlag, setUpdateFlag] = React.useState(false);

  const handleClickOpenDialog = (website) => {
    setDeleteWebsite(website)
    setOpenDeleteDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleCloseDialogAndDeleteBook = () => {

    setOpenDeleteDialog(false);
    axios.delete('http://127.0.0.1:5000/website/' + deleteWebsite.identifier).then(
      res => {
        var index = 0;

        setWebsites(prevState => (prevState.filter(website => website.identifier !== deleteWebsite.identifier)))
      }

    ).catch(err => {
      console.log(err);
    })

  }
  
  useEffect(() => {
    if (updateFlag) {
      console.log(updateWebsite)
      axios.put('http://127.0.0.1:5000/website_record/' + updateWebsite.identifier, updateWebsite).then(
        res => {
          setWebsites(prevWebsites => {
            var actualWebsites = []
            prevWebsites.forEach(website => {
              if (website.identifier === updateWebsite.identifier) {
                website.active = updateWebsite.active;
                website.regex = updateWebsite.regex;
                website.periodicity = updateWebsite.periodicity;
              }
              actualWebsites.push(website)
            })
            return actualWebsites;
          })
        }

      ).catch(err => {
        console.log(err);
      })
      setUpdateFlag(false)
    }

  }, [updateFlag])

  const pagination = (page) => {
    setCurrentPage(page);
    const startIndex = (page - 1) * pageSize;
    setPaginatedWebsites(_(websites).slice(startIndex).take(pageSize).value())
  }

  const paginationExecution = (page) => {
    setCurrentPageExecutions(page);
    const startIndex = (page - 1) * pageSizeExecution;
    setPaginatedExecutions(_(executions).slice(startIndex).take(pageSizeExecution).value())
  }

  if (selectedTab === '1') {
    return (
      <div className="App">
        <SearchAppBar setSelectedTab={setSelectedTab} setFilters={setFilters} setWebsites={setWebsites} setPaginatedWebsites={setPaginatedWebsites} />
        <Table>
          <thead>
            <tr>
              <th>#</th>
              <th onClick={()=>{  console.log("SORTING");sortingWebsites("url")}}>Url</th>
              <th>Periodicity</th>
              <th>Label</th>
              <th>Tags</th>
              <th onClick={()=>{ sortingWebsites("time")}}>Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {

              _(websites).slice((currentPage - 1) * pageSize).take(pageSize).value().map(website => (
                <tr>
                  <td>{website.identifier}</td>
                  <td>{website.url}</td>
                  <td>{website.periodicity}</td>
                  <td>{website.label}</td>
                  <td>{website.tags}</td>
                  <td>{website.time}</td>
                  <td>{website.status}</td>
                  <td>
                    <Button color='success' size='sm' className="edit" onClick={() => { toggleModalAndUpdate(website) }}>Update</Button>
                    <Button color='danger' size='sm' onClick={() => { handleClickOpenDialog(website) }}>Delete</Button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </Table>
        <Modal isOpen={state.modal}
        >

          <ModalHeader>Update Website</ModalHeader>
          <ModalBody>
            <UpdateForm props={updateWebsite} setUpdateWebsite={setUpdateWebsite}></UpdateForm>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" onClick={handleSubmit}>Submit</Button>
            <Button color="danger" onClick={toggleModal}>Cancel</Button>
          </ModalFooter>

        </Modal>

        <Dialog
          open={openDeleteDialog}
          onClose={handleCloseDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {"Are you sure you want to delete website with url "+deleteWebsite.url+" ?"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Deleting a website will also delete all crawled data and web crawling executions on this website.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button color='success' onClick={handleCloseDialog}>Cancel</Button>
            <Button color='danger' onClick={handleCloseDialogAndDeleteBook} autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
        <nav className='d-flex justify-content-center'>
          <ul className='pagination'>
            {

              pages.map((page) => (
                <li className={
                  page === currentPage ? "page-item active" : "page-item"}
                ><p className='page-link' onClick={() => { pagination(page) }}>{page}</p></li>
              ))
            }
          </ul>
        </nav>
      </div>

    );
  }
  else if (selectedTab === '2') {
    return (<div className="App">
      <ExecutionsAppBar setExecutions={setExecutions} setSelectedTab={setSelectedTab}  />
      <Table>
        <thead>
          <tr>
            <th>#</th>
            <th>Label</th>
            <th>Status</th>
            <th>End time</th>
            <th>Number of sites crawled</th>
          </tr>
        </thead>
        <tbody>
          {
            _(executions).slice((currentPageExecutions - 1) * pageSizeExecution).take(pageSizeExecution).value().map(execution => (
              <tr>
                <td>{execution.id}</td>
                <td>{execution.label}</td>
                <td>{execution.status}</td>
                <td>{(execution.status !== 'loading') ? execution.end_time : 'N/A' }</td>
                <td>{execution.nr_of_sites_crawled}</td>
              </tr>
            ))
          }
        </tbody>
      </Table>
      <nav className='d-flex justify-content-center'>
        <ul className='pagination'>
          {

            pagesExecution.map((page) => (
              <li className={
                page === currentPageExecutions ? "page-item active" : "page-item"}
              ><p className='page-link' onClick={() => { paginationExecution(page) }}>{page}</p></li>
            ))
          }
        </ul>
      </nav>
    </div>
    )
  }
  else {
    return (<div className="App">
      <GraphPage setSelectedTab={setSelectedTab}  />
      
    </div>
    )
  }
}

export default App;
