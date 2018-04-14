class API {
  constructor() {}
  fetch() {
    return fetch( this.getEndPoint() )
      .then( response => {
        if ( !response.ok || response.status !== 200 ) {
          throw new Error( this.onFetchError );
        } else {
          const customResponse = response.clone();
          return customResponse.json();
        }
      } );
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
  }
  getEndPoint() {
    let ep = `${this.endpointBase}${this.epOperand}?v=${this.version_key}&client_id=${this.client_id}&client_secret=${this.client_key}&near=${this.near}&limit=${this.limit}`;
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
    this.section = 'topPicks';
    this.limit = 50;
    return this.fetch();
  }
}