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
const App = function () {
  defineExtenders();
  this.ui_query = ko.observable( '' )
    .extend( {
      alphaNumeric: "Please input a combination of alphabets and numbers or just alphabets"
    } );
  this.errorMsg = ko.observable( '' );
  this.venues = ko.observableArray();
  this.currentVenue = ko.observable( '' );
  this.venueCards = new Map();
  //gather list of venues at current location from foursuare API
  this.fetchFSqVenues = function () {
    //Fetch venues around the chosen place from foursquare
    /*@documentation : https://developer.foursquare.com/docs/api/venues/explore*/
    return new Foursquare()
      .getExplorableVenues()
      .then( foursquare => {
        const recommendedVenues = foursquare.response.groups[ 0 ].items;
        for ( const recommendedVenue of recommendedVenues ) {
          this.venues.push( recommendedVenue.venue )
        }
        this.errorMsg( '' );
        return recommendedVenues;
      } )
      .catch( exception => {
        console.warn( exception );
        this.errorMsg( this.fSqAPI()
          .errorOnFetch );
      } )
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
    if ( this.ui_query()
      .length ) {
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
      if ( !venueList.length ) {
        this.errorMsg( 'Ugh! cant find that! Try something else' );
      }
    }
    venueList = ( venueList.length ) ? venueList : venues;
    //On list updation, update google map object's markable places
    if ( this.plotter instanceof GoogleMap ) {
      this.plotter._locations = venueList;
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
    return this.plotter.markPlace( venue );
  };
};
let ViewModel;
//Where everything begins
const init = function () {
  //Do not use JQ
  ko.options.useOnlyNativeEvents = true;
  //create App
  ViewModel = new App();
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
  ViewModel.plotter = plotter;
};