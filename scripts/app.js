const ViewModel = function () {
  this.ui_query = ko.observable( '' );
  this.errorMsg = ko.observable( '' );
  this.venues = ko.observableArray();
  //gather list of venues at current location from foursuare API
  this.fSqAPI = ko.observable( new Foursquare() );
  this.fSqVenues = ko.computed( () => {
    return this.fSqAPI()
      .fetch()
      .then( foursquare => {
        const venues = foursquare.response.venues;
        for ( const venue of venues ) {
          this.venues.push( venue )
        }
        this.errorMsg( '' );
        return venues;
      } )
      .catch( exception => {
        this.errorMsg( this.fSqAPI()
          .errorOnFetch );
      } )
  } );
};