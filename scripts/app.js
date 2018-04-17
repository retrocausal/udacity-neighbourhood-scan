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
        const invalid = /[^a-zA-Z0-9]/.test( value );
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
  this.fSqAPI = ko.observable( new Foursquare() );
  this.fSqVenues = ko.computed( () => {
    //Fetch venues around the chosen place from foursquare
    /*@documentation : https://developer.foursquare.com/docs/api/venues/explore*/
    return this.fSqAPI()
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
  } );
  this.filteredVenues = ko.computed( () => {
    this.errorMsg( '' );
    let venues = ko.observableArray();
    if ( this.ui_query()
      .length > 0 ) {
      const SubString = this.ui_query()
        .toLowerCase();
      for ( const venue of this.venues() ) {
        if ( venue.name.toLowerCase()
          .indexOf( SubString ) !== -1 ) {
          venues.push( venue );
        }
      }
    }
    if ( this.ui_query()
      .length && !venues()
      .length ) {
      this.errorMsg( 'No results' );
    } else {
      const venueList = ( venues()
        .length > 0 ) ? venues() : this.venues();
      if ( this.plotter instanceof GoogleMap ) {
        this.plotter._locations = venueList;
      }
      return venueList;
    }
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

  this.showMe = ( venue ) => {
    return this.plotter.markPlace( venue );
  };
};
let ViewModel;
const init = function () {
  ko.options.useOnlyNativeEvents = true;
  ViewModel = new App();
  ko.applyBindings( ViewModel );
};

const addPlotter = function () {
  const plotter = new GoogleMap()
    .init()
    .layout();
  ViewModel.plotter = plotter;
};