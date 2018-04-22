# Neighbourhood Scan
This is a project completed as a part of the Udacity Front end nanodegree
The aim is two fold

 - List a list of places around a popular neighbourhood
     - add a filter / search within list functionality
 - Have a google powered map on page
     - On user induced filters on the list, filter and mark the filtered list on the accompanying google map

This project uses [knockout](http://knockoutjs.com) which Udacity recommended, to bind the presentation across markup to the javascript class that feeds it.

## Architecture

The project has three tiers of logical separation of concerns
 - A Knockout ViewModel
     - Used to represent the data in and out of the front end markup
 - A Google Map class
    - Used to `geocode` addresses from the list of venues that knockout filters
    - Used to place a marker on the set of filtered venues
 - An API class
    - Used to define a base Asynchronous API call via the `fetch` api
    - Also defines three different third party APIs put to use for this project
       - [Foursquare](https://developer.foursquare.com)[_*For Venue lists*_]
       - [Flickr](https://www.flickr.com/services/developer/api/)[_*For photos*_]
       - [Wikipedia Media API](https://en.wikipedia.org/api/rest_v1/)

## Flow

 - The project uses knockout to *bind* sections on the markup reserved for listing venues, to an asynchrounous `fetch` call to foursquare

 - On retrieving results from foursquare's `explore` endpoint, knockout relays the available venues to the section of presentation that creates an unordered list of such venues.

 - Each item in the list has an _expandable_ card that binds a click event on the item back to knockout's model

 - knockout then hands this item's details to a google map object

 - the google map object `geocodes` the address on the item and marks the place on the map.

 - The UI also has a _search_ filter which being bound to knockout's model, can filter the list of venues

    - On filter, only a filtered list of venues are listed, and the flow is as described above.

 - Both on initial venue fetch, and on any subsequent filters,
 knockout relays the listable set of venues to the google map object for marker updation

 - On initial listing, or on subsequent filters, knockout makes a `fetch` call to _wikipedia_ and retrieves the best information it can from wikipedia.

    - This detail is mapped to the google map object by knockout, on fetch results
    - The google map object uses these details to populate infowindows for when a place's marker is clicked.

### Installation

 - clone the repo
 - cd to the project folder
 - In case you do not find a `bower_components` directory,
     - Do run `bower install`
       >*Note* [bower](https://bower.io) is a frontend package manager
       If you do not have it pre installed, run `npm install -g bower`
 - Navigate to the path of your project folder via a browser
     - preferrably, use a webserver such as `nginx / apache`

### Art and you across NY

 - From the list of available locations on the panel to the left,
 see If you like any.
 - If you do, expand the venue and click _view on map_
     - You should see a marker on the map turn blue in a second or two.
 - If there are a considerable lot of locations on the list on the panel, use the _Search box_ on the panel to narrow down the results
     - You need to type in a string, and click on the _Funnel_ icon
     - You can clear the filters by clicking the _Trash_ icon
 - On the map, you can click on a _marker_ and If the app has gotten extra info from _Wikipedia_ , you should see a _read more_ link
   - For your convenience, the marker bounces so you know which marker you have currently clicked
   
**Go on, and be an art aficionado**
