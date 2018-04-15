const ViewModel = function () {
  this.ui_query = ko.observable( '' );
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
        this.errorMsg( this.fSqAPI()
          .errorOnFetch );
      } )
  } );
  this.filteredVenues = '';
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
};