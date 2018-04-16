class GoogleMap {
  constructor() {
    this.map = google.maps.Map;
    this.container = document.querySelector( '#map' );
  }
  init( ...options ) {
    const Options = ( options.length ) ? options : [ {
      lat: 40.7413549,
      lng: -73.99802439999999
    }, 13, [] ];
    const [ center, zoom, styles ] = Options;
    this.config = {
      center,
      zoom
    };
    if ( styles.length ) {
      this.config.styles = styles;
    }
    return this;
  }
  layout() {
    const map = new this.map( this.container, this.config );
    return this;
  }
}