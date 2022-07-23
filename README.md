# Web Crawler
  Web crawler project with web-based interface. The application crawles websites inputted by user and provides different types of data visualisation regarding given sites.
## Frontend
  UI component that allows visualisation of the websites, executions and crawled data. The user can view a map (network) of crawled websites along with their data. The network provides two views : website view, which has one node per website, and website view, whichs clusters websites by their domains. The network is updated in real time and the user can request executions from any node in the graph.s
#### Implementation
  The component is implemented in Javascript, using React rendering library. Additional libraries used : Material UI, React Routing, Axios, Vis.js.
## Backend
### Website records API
  REST API that provides also a Graphql endpoint, responsible for hosting website records, executions and crawled data.
#### Implementation
  The component is implemented in Python using Flask Framework and Ariadne library for the Graphql endpoint. Persistency layer is ensured using SQLAlchemy with PostgreSQL Database.
### Web Spider
  Web Spider component responsible for crawling given sites, periodically or upon request, asynchronously using task queues. The spider obtains information about the given site and also the sites refrenced by it that match a certain regex.
#### Implementation
  The component is implemented in Python and it uses Redis task queue.