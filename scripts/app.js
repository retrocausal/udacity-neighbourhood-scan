class APIFactory {
  constructor( api ) {
    switch ( api ) {
    case 'foursuare':
      this.endpoint = 'https://api.foursquare.com/v2/venues/search?near=Chicago,IL&client_id=T0PTN51XSMDSBQH4PVVJMHQ3GVWER1RHLHYWDUZ3TUQRBBUV&client_secret=RYPI50YPMRG1VY3FQEQV1QAI333HGAXIO0IUOQDU510LPV2L&radius=2000&limit=24&intent=browse&v=20180412';
      this.onFetchError = 'Could not load trending venues';
      break;
    default:

    }
  }
  fetch() {
    return fetch( this.endpoint )
      .then( response => {
        if ( !response.ok || response.status !== 200 ) {
          throw new Error( this.onFetchError );
        } else {
          const customResponse = response.clone();
          return customResponse.json();
        }
      } )
      .catch( exception => {
        console.warn( exception );
      } );
  }
}


const ViewModel = function () {
  this.ui_query = ko.observable( '' );
  this.noop = ko.observable( 'No results' );
  this.venues = ko.observableArray();
  //gather list of venues at current location from foursuare API
  this.fSqAPI = ko.observable( new APIFactory( 'foursuare' ) );
  this.fSqVenues = ko.computed( () => {
    const venues = this.fSqAPI()
      .fetch()
      .then( foursquare => {
        const venues = foursquare.response.venues;
        for ( const venue of venues ) {
          this.venues.push( venue )
        }
        return venues;
      } )
  } );
};