class API {
  constructor() {}
  fetch( customError = '' ) {
    if ( !this.getEndPoint() ) {
      return false;
    }
    return fetch( this.getEndPoint() )
      .then( response => {
        if ( !response.ok || response.status !== 200 ) {
          throw ( `${this.onFetchError} ${customError}` );
        } else {
          const customResponse = response.clone();
          return customResponse.json();
        }
      } );
  }
}
class Flickr extends API {
  constructor() {
    super();
    this.key = '9753596f1d6929aa87e5a8117516a840';
    this.secret = 'a12b247c51db75c0';
  }
}
class Wiki extends API {
  constructor() {
    super();
    this.endpointBase = 'https://en.wikipedia.org/api/rest_v1/page/summary';
    this.endpoint = `${this.endpointBase}/`; //`${this.endpointBase}?action=query&prop=extracts&format=json&redirects=yes&explaintext&exchars=250&exlimit=5&exintro`;
    this.onFetchError = `could not find a wiki page for`;
  }
  setTitle( venue ) {
    const title = ( venue ) ? `${venue.name}` : '';
    this.title = encodeURI( title );
    return this;
  }
  getEndPoint() {
    let endpoint;
    if ( this.title.length ) {
      endpoint = `${this.endpoint}${this.title}`;
    }
    return endpoint;
  }
}
class Foursquare extends API {
  constructor() {
    super();
    this.endpointBase = 'https://api.foursquare.com/v2/venues/';
    this.client_id = 'T0PTN51XSMDSBQH4PVVJMHQ3GVWER1RHLHYWDUZ3TUQRBBUV';
    this.client_key = 'RYPI50YPMRG1VY3FQEQV1QAI333HGAXIO0IUOQDU510LPV2L';
    this.version_key = '20180412';
    this.epOperand = 'search';
    this.near = 'NY';
    this.errorOnFetch = 'Could not load places to hang out at';
    this.limit = 24;
    this.radius = 100000;
    this.llAcc = 10.0;
  }
  getEndPoint() {
    let ep = `${this.endpointBase}${this.epOperand}?v=${this.version_key}&client_id=${this.client_id}&client_secret=${this.client_key}&time=any&day=any&near=${this.near}&limit=${this.limit}&radius=${this.radius}&llAcc=${this.llAcc}`;
    if ( this.intent )
      ep = ep + `&intent=${this.intent}`;
    if ( this.section )
      ep = ep + `&section=${this.section}`;
    return ep;
  }
  getTrendingVenues() {
    this.epOperand = 'trending';
    this.limit = 50;
    this.section = false;
    this.intent = false;
    return this.fetch();
  }
  getExplorableVenues() {
    this.epOperand = 'explore';
    this.intent = false;
    this.section = 'arts';
    this.limit = 10;
    return this.fetch();
  }
}