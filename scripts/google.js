class GoogleMap {
  constructor() {
    this.container = document.querySelector( '#map' );
  }
  set _locations( places ) {
    this.resetMarkers();
    for ( const location of places ) {
      this.markables.set( location, {
        lat: location.location.lat,
        lng: location.location.lng
      } );
    }
    this.markPlaces();
    console.log( this.markables );
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
    this.base = google.maps;
    this.markables = new Map();
    this.markers = new Set();
    return this;
  }
  layout() {
    const map = new this.base.Map( this.container, this.config );
    this.map = map;
    return this;
  }
  resetMarkers() {
    this.markables.clear();
    for ( const marker of this.markers ) {
      marker.setMap( null );
    }
    this.markers.clear();
  }
  markPlaces() {
    const infoWindow = new this.base.InfoWindow();
    const bounds = new this.base.LatLngBounds();
    for ( const markable of this.markables ) {
      const marker = new this.base.Marker( {
        title: markable[ 0 ].name,
        map: this.map,
        position: markable[ 1 ],
        animation: this.base.Animation.DROP
      } );
      bounds.extend( marker.position );
      marker.addListener( 'click', () => {
        this.showInfo( marker, infoWindow );
      } );
      this.markers.add( marker );
    }
    this.map.fitBounds( bounds );
  }
  // This function populates the infowindow when the marker is clicked. We'll only allow
  // one infowindow which will open at the marker that is clicked, and populate based
  // on that markers position.
  showInfo( marker, infowindow ) {
    // Check to make sure the infowindow is not already opened on this marker.
    if ( infowindow.marker !== marker ) {
      infowindow.marker = marker;
      infowindow.setContent( '<div>' + marker.title + '</div>' );
      infowindow.open( this.map, marker );
      // Make sure the marker property is cleared if the infowindow is closed.
      infowindow.addListener( 'closeclick', function () {
        infowindow.setMarker = null;
      } );
    }
  }
}