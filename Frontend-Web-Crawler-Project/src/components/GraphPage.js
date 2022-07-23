import React from 'react'
import GraphAppBar from './GraphAppBar'
import Graph from './Graph'
export default function GraphPage( {setSelectedTab}) {
  const [displayedWebsites, setDisplayedWebsites] = React.useState([])  
  return (
    <>
    <GraphAppBar setSelectedTab={setSelectedTab} setParentWebsites={setDisplayedWebsites}/>
    <Graph displayedWebsites={displayedWebsites}/>
    </>
  )
}
