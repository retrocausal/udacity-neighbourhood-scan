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
class Flickr extends API {
  constructor() {
    super();
    this.key = '9753596f1d6929aa87e5a8117516a840';
    this.secret = 'a12b247c51db75c0';
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
    this.radius = 2500;
    this.llAcc = 10000.0001;
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
    this.section = 'topPicks';
    this.limit = 10;
    return this.fetch();
  }
}