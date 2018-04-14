const ViewModel = function () {
  this.ui_query = ko.observable( '' );
  this.errorMsg = ko.observable( '' );
  this.venues = ko.observableArray();
  this.venueCardID = ko.observable( '' );
  //gather list of venues at current location from foursuare API
  this.fSqAPI = ko.observable( new Foursquare() );
  this.fSqVenues = ko.computed( () => {
    return this.fSqAPI()
      .getExplorableVenues()
      .then( foursquare => {
        let venues = [];
        const recommendedVenues = foursquare.response.groups[ 0 ].items;
        for ( const recommendedVenue of recommendedVenues ) {
          this.venues.push( recommendedVenue.venue )
        }
        this.errorMsg( '' );
        return venues;
      } )
      .catch( exception => {
        this.errorMsg( this.fSqAPI()
          .errorOnFetch );
      } )
  } );
  this.filteredVenues = '';
  this.fetchInfo = ( venue ) => {
    this.venueCardID( venue.id );
  };
  this.hasVenue = ( id ) => {
    if ( this.venueCardID() !== id ) {
      return false;
    }
    return true;
  };
};