import React from 'react'
import { Component, createRef } from 'react';
import { DataSet, Network } from 'vis';
import { Dialog, DialogContentText, DialogContent, DialogTitle, DialogActions, Button, List, ListItem, Avatar, ListItemText, ListItemAvatar, Box, circularProgressClasses } from '@mui/material';
import './Graph.css'
import axios from 'axios';
import { Alert, AlertTitle } from '@mui/material';
import Slide from '@mui/material/Slide';
import LinkIcon from '@mui/icons-material/Link';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import {IconButton} from '@mui/material'
import AddIcon from '@mui/icons-material/Add';
import AddCrawledForm from './AddCrawledForm';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
const Transition = React.forwardRef(function Transition(props, ref) {
 return <Slide direction="up" ref={ref} {...props} />;
});


export default class Graph extends Component {
 constructor(props) {
 super(props);
 this.network = {};
 this.appRef = createRef();
 this.state = {error: '', alert: false, flag: false, websites:[], addWebsite: {}, modal:false, isClustered: false, openDialog: false, checked: false, website: {}, domains: new Set(), network: {} };
 this.handleAlert.bind(this);
 this.handlePopoverClose.bind(this);
 this.handlePopoverOpen.bind(this);
 this.clusterByDomain.bind(this);
 this.createUnclustered.bind(this);
 this.displayConditional.bind(this);
 this.sendPostRequest.bind(this);
 this.closeDialog.bind(this)
 this.openModal.bind(this)
 this.closeModal.bind(this)
 this.submitModal.bind(this)
 this.setAdd.bind(this)
 this.startExecution.bind(this)
 this.displayConditionalLinks.bind(this)
 
 }
 startExecution(website){
 this.setState((prevState) => ({error: prevState.error, alert: prevState.alert,flag: prevState.flag,websites: prevState.websites, addWebsite: prevState.addWebsite,modal: prevState.modal,openDialog: true, website: prevState.website, checked: prevState.checked, domains: prevState.domains, network:prevState.network }))
 const addExecution = { url : website.url} 
 axios.post('http://127.0.0.1:5000/execution/empty', addExecution).then(
 res => { 
 console.log(res)
 }

 ).catch(err => {
 console.log(err);
 })
 }
 handleAlert(){
 this.setState((prevState) => ({error: '', alert: false,flag: prevState.flag,websites: prevState.websites,addWebsite: prevState.addWebsite,modal: false,isClustered: prevState.isClustered, isopenDialog: prevState.openDialog, checked: true, website: prevState.website, domains: prevState.domains, network: prevState.network }));

 }
 openModal(){
 console.log("OPEN MODAL")
 
 this.setState((prevState) => ({error: prevState.error, alert: prevState.alert,flag: true,websites: prevState.websites,addWebsite: prevState.addWebsite,modal: false,isClustered: prevState.isClustered, isopenDialog: prevState.openDialog, checked: true, website: prevState.website, domains: prevState.domains, network: prevState.network }));

 }

 closeModal(){
 console.log('close modal')
 this.setState((prevState) => ({error: prevState.error, alert: false,flag: false,websites: prevState.websites,addWebsite: prevState.addWebsite,modal: false,isClustered: prevState.isClustered, isopenDialog: prevState.openDialog, checked: true, website: prevState.website, domains: prevState.domains, network: prevState.network }));
 }

 submitModal(){
 if (this.state.addWebsite.periodicity ==='' || this.state.addWebsite.label === '' || this.state.addWebsite.periodicity === '' || this.state.addWebsite.tags===[] ){
 this.setState((prevState) => ({error: "PLease fill in the required fields", alert: true,flag: prevState.flag,websites: prevState.websites,addWebsite: prevState.addWebsite,modal: false,isClustered: prevState.isClustered, isopenDialog: prevState.openDialog, checked: true, website: prevState.website, domains: prevState.domains, network: prevState.network }));
 return
 }
 axios.post('http://127.0.0.1:5000/website', this.state.addWebsite).then(
 res => {
 this.setState((prevState) => ({error: prevState.error, alert: prevState.alert,flag: false,websites: prevState.websites,addWebsite: {},modal: false,isClustered: prevState.isClustered, isopenDialog: prevState.openDialog, checked: true, website: prevState.website, domains: prevState.domains, network: prevState.network }));

 }

 ).catch(err => {
 console.log(err);
 this.setState((prevState) => ({error: err.response.data, alert: true,flag: prevState.flag,websites: prevState.websites,addWebsite: prevState.addWebsite,modal: false,isClustered: prevState.isClustered, isopenDialog: prevState.openDialog, checked: true, website: prevState.website, domains: prevState.domains, network: prevState.network }));

 })

 
 
 }

 handlePopoverOpen = (node, label, content) => {
 
 const url_api = 'http://127.0.0.1:5000/crawled_data/' + node
 
 axios.get(url_api).then(
 res => {
 const w = res.data
 if ('crawl_time'in w){
 this.setState((prevState) => ({error: prevState.error, alert: prevState.alert,flag: prevState.flag,websites: prevState.websites,addWebsite: prevState.addWebsite,modal: prevState.modal,isClustered: prevState.isClustered, isopenDialog: prevState.openDialog, checked: true, website: { id: node, url: w.url, regex: w.regex, periodicity: w.periodicity, label: w.label, tags: w.tags, crawl_time: w.crawl_time, time: w.time, status: w.status }, domains: prevState.domains, network: prevState.network }));
 }
 else {
 this.setState((prevState) => ({error: prevState.error, alert: prevState.alert,flag: prevState.flag,websites: prevState.websites, addWebsite: prevState.addWebsite,modal: prevState.modal,isClustered: prevState.isClustered, openDialog: prevState.openDialog, checked: true, website: { id: node, url: w.url, crawl_time: 'N/A', title:'N/A'}, domains: prevState.domains, network: prevState.network }));
 }
 
 }

 ).catch(err => {
 if (err.response.status == '404' || err.response.status =='409' || err.response.status == '400'){
 
 const link = { 'link': label }
 axios.post('http://127.0.0.1:5000/website_records/crawled',link).then(
 res => {
 console.log(res.data)
 this.setState((prevState) => ({error: prevState.error, alert: prevState.alert,flag: prevState.flag,websites: res.data, addWebsite: {url: label},modal: prevState.modal,isClustered: prevState.isClustered, openDialog: prevState.openDialog, checked: true, website: { id: node, url: label, content: content}, domains: prevState.domains, network: prevState.network })); 
 }
 ).catch(err => {
 console.log(err);
 
 })
 
 }
 console.log(err);

 })


 };
 closeDialog () {
 this.setState((prevState) => ({error: prevState.error, alert: prevState.alert,flag: prevState.flag, websites: prevState.websites,addWebsite: prevState.addWebsite,modal: prevState.modal,isClustered: prevState.isClustered, openDialog: false, website: prevState.website, checked: prevState.checked, domains: prevState.domains, network:prevState.network }))
 }

 handlePopoverClose = () => {
 
 this.setState((prevState) => ({error: prevState.error, alert: prevState.alert,flag: prevState.flag,websites: prevState.websites,addWebsite: prevState.addWebsite, modal: prevState.modal, isClustered: prevState.isClustered, openDialog: prevState.openDialog, website: {}, checked: false, domains: prevState.domains, network: prevState.network }));
 };

 componentDidMount() {
 this.createUnclustered()

 }

 componentDidUpdate(prevProps) {
 // Typical usage (don't forget to compare props):
 console.log(this.props.displayedWebsites)
 if ((this.props.displayedWebsites !== prevProps.displayedWebsites)&& (!this.state.isClustered)) {
 this.createUnclustered()
 }
 }

 

 createUnclustered() {
 var e = []
 var n = []
 var added = []
 var urls = []
 const map1 = new Map();
 const domains = new Set()

 const websites = this.props.displayedWebsites
 
 var identifiers = []
 websites.forEach(website => {
 const id = website.identifier
 added.push(website.identifier)
 urls.push(website.url)
 map1.set(website.url, id)
 var domain = website.url
 const tokens = domain.split('/')
 domain = tokens[0] + '//' + tokens[2]

 domains.add(domain)
 const content = 'Title: ' + website.title + '\n Crawl Time: ' + website.crawl_time
 if (website.active) {
 n.push({ id,color: '#E78587', label: website.label, title: content, domain: domain })
 }
 
 })
 
 
 const url_api = 'http://127.0.0.1:5000/links' 
 
 axios.get(url_api).then(
 res => {
 const links = res.data
 var count = 0;
 
 links.forEach(link => {
 const parent = link.crawled_data_url
 const child = link.link
 if (! urls.includes(child))
 {
 urls.push(child)
 const crawl_time = link.crawl_time
 const title = link.title
 const id_parent = map1.get(parent)
 if (added.includes(id_parent)){
 var domain = child;
 const tokens = domain.split('/')
 domain = tokens[0] + '//' + tokens[2]
 domains.add(domain)
 if (map1.has(child)){
 const id_child = map1.get(child)
 e.push({ from: id_parent, to: id_child, length: 300 })
 }
 else {
 const linkId = 100* id_parent+count;
 
 
 if (crawl_time){
 
 const content = 'Title: ' + title + ' Crawl Time: ' + crawl_time
 n.push({ id: linkId,title: content, label: child, domain: domain })
 e.push({ from: id_parent, to: linkId, length: 100 })
 }
 else {
 n.push({ id: linkId,title: child, label: child, color: '#A9F1E6', domain: domain })
 e.push({ from: id_parent, to: linkId, length: 100 })
 }
 count += 1
 }}}
 else {
 if (map1.has(child)){
 const id_parent = map1.get(parent)
 const id_child = map1.get(child)
 e.push({ from: id_parent, to: id_child, length: 300 })
 }
 }

 }) 
 
 const nodes = new DataSet(n);
 // create an array with edges
 const edges = new DataSet(e);
 const data = {
 nodes: nodes,
 edges: edges
 };
 
 const options = {
 
 nodes: {
 shape: "circle",
 font: {
 size: 12
 },
 },
 edges: {
 font: {
 align: "top"
 },
 arrows: {
 to: { enabled: true, scaleFactor: 1, type: "arrow" }
 }
 },
 layout: {
 hierarchical: {
 direction: "LR",
 sortMethod: "directed",
 treeSpacing: 100,
 nodeSpacing: 200,
 levelSeparation: 500
 
 }
 },
 
 interaction: {
 
 hover: true
 },
 }
 this.network = new Network(this.appRef.current, data, options);
 this.network.on('doubleClick', function (properties) {
 const number = properties.nodes[0]
 
 if (number){
 const node = this.network.body.data.nodes._data[number]
 this.handlePopoverOpen(number,node.label,node.title);
 }
 
 
 
 }.bind(this));
 this.setState((prevState) => ({error: prevState.error, alert: prevState.alert,flag: prevState.flag, websites: prevState.websites,addWebsite: prevState.addWebsite,modal: prevState.modal,isClustered: false,openDialog: prevState.openDialog, website: prevState.website, checked: prevState.checked, domains: domains, network: this.network }))
 
 }

 ).catch(err => {
 console.log(err);

 })

 // websites.forEach(website => {
 // const links = website.links;
 // var count = 0;
 // const id = website.identifier
 // links.forEach(link => {
 // var domain = link
 // const tokens = domain.split('/')
 // domain = tokens[0] + '//' + tokens[2]
 // console.log('Url: ' + website.url + ' Domain: ' + domain)
 // domains.add(domain)
 // const linkId = 1000 * id + count
 // console.log(linkId)
 // if (added.includes(link)) {
 // const actualId = map1.get(link)
 // e.push({ from: id, to: actualId, length: 300 })
 // }
 // // else {
 // // n.push({ id: linkId, label: link, color: '#A9F1E6', domain: domain })
 // // e.push({ from: id, to: linkId, length: 300 })
 // // count += 1
 // // }
 // })
 // })
 }

 sendPostRequest(){
 this.setState((prevState) => ({error: prevState.error, alert: prevState.alert,flag: prevState.flag,websites: prevState.websites, addWebsite: prevState.addWebsite,modal: prevState.modal,openDialog: true, website: prevState.website, checked: prevState.checked, domains: prevState.domains, network:prevState.network }))
 const addExecution = { url : this.state.website.url} 
 axios.post('http://127.0.0.1:5000/execution/empty', addExecution).then(
 res => {
 
 console.log(res)
 

 }

 ).catch(err => {
 console.log(err);
 
 })
 }


 clusterByDomain() {

 var clusterOptionsByData;
 
 
 for (const domain of this.state.domains) {

 
 clusterOptionsByData = {
 joinCondition: function (childOptions) {
 return childOptions.domain === domain; // the color is fully defined in the node.
 },
 processProperties: function (clusterOptions, childNodes, childEdges) {
 var totalMass = 0;
 for (var i = 0; i < childNodes.length; i++) {
 totalMass += childNodes[i].mass;
 }
 clusterOptions.mass = totalMass;
 return clusterOptions;
 },
 clusterNodeProperties: {
 id: "cluster:" + domain,
 borderWidth: 3,
 shape: "circle",
 domain: domain,
 label: "domain: " + domain,
 title: "domain: " + domain
 },
 };
 
 this.network.cluster(clusterOptionsByData);

 this.setState((prevState) => ({error: prevState.error, alert: prevState.alert,flag: prevState.flag,websites: prevState.websites,addWebsite: prevState.addWebsite,modal: prevState.modal,isClustered: true, openDialog: prevState.openDialog, website: prevState.website, checked: prevState.checked, domains: prevState.domains, network: this.network }))
 this.forceUpdate()
 }
 }

 displayConditionalLinks(){
 if ('content'in this.state.website){
 const content = this.state.website.content;
 
 const label = this.state.website.url
 if (content === this.state.website.url)
 {
 return(
 <>
 </> 
 )
 }
 else {
 const tokens = content.split(' ')
 const crawl_time = tokens[tokens.length-1]
 const title = tokens[1]
 return(
 <>
 <ListItem autoFocus >
 <ListItemAvatar>
 <Avatar>
 <AccessTimeIcon />
 </Avatar>
 </ListItemAvatar>
 <ListItemText primary={crawl_time} />
 </ListItem>
 {this.state.websites.map(website => {
 const text = website.url + "," + website.label+","+website.periodicity+","+website.crawl_time+","+website.end_time+","+website.status;
 return (
 <>
 <ListItem autoFocus >
 <ListItemAvatar>
 <Avatar>
 <IconButton onClick={()=>{ this.startExecution(website).bind(this) }}> <PlayCircleOutlineIcon/> </IconButton>
 </Avatar>
 </ListItemAvatar>
 <ListItemText primary={text} />
 </ListItem>
 </>
 )
 })}
 </> 
 )
 }
 }
 }

 displayConditional() {
 if ('crawl_time' in this.state.website) {
 return (
 <>
 <ListItem autoFocus >
 <ListItemAvatar>
 <Avatar>
 <AccessTimeIcon />
 </Avatar>
 </ListItemAvatar>
 <ListItemText primary={this.state.website.crawl_time} />
 </ListItem>
 <ListItem autofocus>
 <ListItemAvatar>
 <Avatar>
 <IconButton onClick={this.sendPostRequest.bind(this)}>
 <PlayCircleOutlineIcon id='circle-button'/>
 </IconButton>
 </Avatar>
 </ListItemAvatar>
 {this.state.website.url}; {this.state.website.periodicity}; {this.state.website.label}; {this.state.website.time}; {this.state.website.status}
 </ListItem>
 
 </>
 )
 }
 else {
 return (
 <>
 {this.displayConditionalLinks()}
 <ListItem autofocus>
 <ListItemAvatar>
 <Avatar>
 <IconButton onClick={this.openModal.bind(this)}>
 <AddIcon id='circle-button'/>
 </IconButton>
 </Avatar>
 </ListItemAvatar>
 Add Website
 </ListItem>
 </>
 ) 
 }
 }

 setAdd(website){
 this.setState((prevState) => ({addWebsite: website,modal: true,isClustered: prevState.isClustered, openDialog: prevState.openDialog, website: prevState.website, checked: prevState.checked, domains: prevState.domains, network: prevState.network }))
 
 }
 render() {
 
 return (
 <>
 <Box textAlign='center'>
 <Button sx={{ textAlign: 'center' }} onClick={this.clusterByDomain.bind(this)}>Domain View</Button>
 <Button sx={{ textAlign: 'center' }} onClick={this.createUnclustered.bind(this)}>Website View</Button>
 </Box>
 <div key={this.props.displayedWebsites} className="fill-window" ref={this.appRef} >
 <Dialog onClose={this.closeDialog.bind(this)} open={this.state.flag}>
 <DialogTitle>Add Website</DialogTitle>
 <DialogContent>
 <AddCrawledForm props={this.state.addWebsite} setAddWebsite={this.setAdd.bind(this)} />
 <DialogActions>
 <Button onClick={this.submitModal.bind(this)}>Submit</Button>
 <Button onClick={this.closeModal.bind(this)}>Cancel</Button>
 </DialogActions>
 </DialogContent>
 </Dialog>
 <Dialog onClose={this.handlePopoverClose} open={this.state.checked} TransitionComponent={Transition} keepMounted>
 <DialogTitle>{this.state.website.label}</DialogTitle>
 <DialogContent>
 <List sx={{ pt: 0 }}>
 <ListItem autoFocus >
 <ListItemAvatar>
 <Avatar>
 <LinkIcon />
 </Avatar>
 </ListItemAvatar>
 <ListItemText primary={this.state.website.url} />
 </ListItem>
 {this.displayConditional()}
 </List>
 </DialogContent>
 <DialogActions>
 <Button onClick={this.handlePopoverClose.bind(this)}>OK</Button>
 </DialogActions>
 </Dialog>
 <Dialog
 open={this.state.openDialog}
 onClose={this.closeDialog.bind(this)}
 aria-labelledby="alert-dialog-title"
 aria-describedby="alert-dialog-description"
 >
 <DialogTitle id="alert-dialog-title">
 Success
 </DialogTitle>
 <DialogContent>
 <DialogContentText id="alert-dialog-description">
 {"You have successfully started an execution!."}
 </DialogContentText>
 </DialogContent>
 <DialogActions>
 <Button color='success' onClick={this.closeDialog.bind(this)}>Ok</Button>
 </DialogActions>
 </Dialog>
 <Dialog open={this.state.alert} onClose={this.handleAlert.bind(this)}>
 <Alert
 severity='error'
 >
 <AlertTitle>Error!</AlertTitle>
 {this.state.error}
 </Alert>
 <Button onClick={this.handleAlert.bind(this)}>OK</Button>
 </Dialog>
 </div>
 
 </>
 );
 }
}