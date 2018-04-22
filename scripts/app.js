/*
 *@defineExtenders defines custom string validations for the search box
 *It currently defines one extender, the alphaNumeric
 */
const defineExtenders = function () {
  /*
   *@alphaNumeric is a knockout custom string validator
   *It subscribes to updates on keystrokes to the viewModel's ui_query
   *It regexp tests the string input for any invalid inputs
   */
  ko.extenders.alphaNumeric = function ( target, overrideMessage ) {
    //add some sub-observables to our observable
    target.hasError = ko.observable();
    target.validationMessage = ko.observable();

    //define a function to do validation
    function validate( value ) {
      //skip if null
      if ( !value || value.length === 0 ) {
        target.hasError( false );
      } else {
        const invalid = /[^a-zA-Z0-9\d\s]/.test( value );
        target.hasError( invalid ? true : false );
        target.validationMessage( invalid ? overrideMessage || "This field is required to contain only alphanumeric content" : "" );
      }
    }

    //initial validation
    validate( target() );

    //validate whenever the value changes
    target.subscribe( validate );

    //return the original observable
    return target;
  };
};
/*
 *@ViewModel is the data descriptor in the MV-VM knockout framework
 *It defines all possible view bound and other properties of our representation
 *of the app in terms of the data it abstracts
 */
const App = function ( map ) {
  defineExtenders();
  this.ui_query = ko.observable( '' )
    .extend( {
      alphaNumeric: "Please input a combination of alphabets and numbers or just alphabets"
    } );
  this.pageMastHeader = ko.observable( 'Art and you across New York' );
  this.creditor = ko.observable( 'Credits and source attributions' );
  this.listor = ko.observable( 'Foursquare' );
  this.listorURI = ko.observable( 'https://developer.foursquare.com' );
  this.plotterName = ko.observable( 'Powered by Google' );
  this.plotterURI = ko.observable( 'https://developers.google.com/maps/documentation/geocoding/intro' );
  this.informerURI = ko.observable( 'https://en.wikipedia.org' );
  this.listorImg = ko.observable( './assets/static/rasters/Powered-by-Foursquare-full-color-600.png' );
  this.informer = ko.observable( `  Wikipedia` );
  this.errorMsg = ko.observable( '' );
  this.venues = ko.observableArray();
  this.currentVenue = ko.observable( '' );
  this.venueCards = new Map();
  this.venueList = ko.observableArray();
  this.plotter = map;
  this.fSqAPI = new Foursquare();
  this.wiki = new Wiki();

  //gather list of venues at current location from foursuare API
  this.fetchFSqVenues = function () {
    //Fetch venues around the chosen place from foursquare
    /*@documentation : https://developer.foursquare.com/docs/api/venues/explore*/
    return this.fSqAPI
      .getExplorableVenues()
      .then( foursquare => {
        const recommendedVenues = foursquare.response.groups[ 0 ].items;
        for ( const recommendedVenue of recommendedVenues ) {
          this.venues.push( recommendedVenue.venue );
        }
        this.clearFilter();
        this.errorMsg( '' );
        return this.venues();
      } )
      .then( venues => {
        //Now that foursquare geve us top locations
        //Loop through the list of venues from foursquare
        for ( const venue of venues ) {
          //Fetch more information from available wikipedia pages
          this.wiki.setTitle( venue )
            .fetch( venue.name )
            .then( wiki => {
              //Gather useful information not limited to extracts
              let thumbnail = '';
              let article = '';
              const formattedInfoMarkup = wiki.extract_html || '';
              const formattedInfo = wiki.extract || '';
              if ( wiki.thumbnail )
                thumbnail = wiki.thumbnail.source;
              if ( wiki.content_urls )
                article = wiki.content_urls.mobile || wiki.content_urls.desktop;
              //Set a venue to information map on the plotter
              //Used by google when displaying infowindows
              this.plotter.venueInfo.set( venue, {
                formattedInfo,
                formattedInfoMarkup,
                thumbnail,
                article
              } );
            } )
            .catch( wikiException => {
              console.warn( wikiException );
            } );
        }
      } )
      .catch( exception => {
        console.warn( exception );
        this.errorMsg( this.fSqAPI
          .errorOnFetch );
      } );
  };
  /*
   *filteredVenues is what is listed on the app
   *filteredVenues checks if the user has input a query
   *Searches the current list of places for the queried input
   *Returns all places if nothing mathces
   *else returns matched places
   *While filteredVenues updates itself, on update, it also
   *sets the google map's markable locations
   *HOWEVER, it does not create hese markers.
   */
  this.filteredVenues = ko.computed( () => {
    const venues = this.venues();
    let venueList = [];
    this.errorMsg( '' );
    //gatherr user input
    const SubString = this.ui_query()
      .toLowerCase();
    //do a search
    for ( const venue of venues ) {
      if ( venue.name.toLowerCase()
        .indexOf( SubString ) !== -1 ) {
        venueList.push( venue );
      }
    }
    return venueList;
  } );

  this.fetchInfo = ( venue ) => {
    //Once you can get a premium foursquare account,
    //use this space to fetch venue details
    //Until then, meh just make a dummy detail

    //Set the current venue to the clicked venue
    this.currentVenue( venue.id );
  };
  this.hasVenue = ( venue ) => {
    //Once you have a premium account and can check if the
    //clicked venue has a venue card, change this behaviour
    //to fetch the associated card, or return false thereof


    //Until then, return true if the currentVenue is set to the clicked venue
    return ( this.currentVenue() === venue.id );
  };
  //direct google map object to mark a place
  //happens when user clicks on a place
  this.showMe = ( venue ) => {
    this.closeDrawer();
    return this.plotter
      .highlightPlace( venue );
  };
  //Return listable set of venues
  this.getVenues = function ( filtered ) {
    let venues = this.venues();
    if ( filtered ) {
      return this.filteredVenues();
    }
    return venues;
  };
  //Applies a filter on the list of venues
  this.applyFilter = function () {
    const venues = this.getVenues( true );
    //If no venues returned post filter, show error
    if ( !venues.length ) {
      this.errorMsg( 'Ugh! cant find that! Try something else' );
    }
    //Set / Update markable venues
    if ( this.plotter instanceof GoogleMap && venues.length ) {
      this.plotter._locations = venues;
    }
    //List filtered venues
    this.venueList( venues );
  };
  //clears filters
  this.clearFilter = function () {
    //On list updation, update google map object's markable places
    if ( this.plotter instanceof GoogleMap && this.venues()
      .length ) {
      this.plotter._locations = this.venues();
    }
    //clear search query
    this.ui_query( '' );
    //List reset
    this.venueList( this.venues() );
  };
  //hamburger activate
  this.openDrawer = function () {
    //Activate Hamburgers
    this.offCanvasUI( false );
  };
  //hamburger deactivate
  this.closeDrawer = function () {
    //DeActivate Hamburgers
    this.offCanvasUI( true );
  };
  //Hamburger configuration
  this.offCanvasUI = ko.observable( true );
  //Hamburger handler
  this.getOffCanvasUI = ko.computed( () => {
    return this.offCanvasUI();
  } );
};
let ViewModel;
//Where everything begins
const init = function ( map ) {
  //Do not use JQ
  ko.options.useOnlyNativeEvents = true;
  //create App
  ViewModel = new App( map );
  //Apply Bindings
  ko.applyBindings( ViewModel );
  //fetch trending venues to list
  ViewModel.fetchFSqVenues();
};
//addPlotter sets the mapper for our app
const addPlotter = function () {
  const plotter = new GoogleMap()
    .init()
    .layout();
  //Create new App
  init( plotter );
};