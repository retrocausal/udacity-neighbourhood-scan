class GoogleMap {
  constructor() {
    this.container = document.querySelector( '#map' );
  }
  set _locations( places ) {
    this.resetMarkers();
    for ( const place of places ) {
      this.markables.set( place, {
        lat: place.location.lat,
        lng: place.location.lng
      } );
    }
    this.markPlaces();
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
    this.markers = new Map();
    this.altMarker();
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
      marker[ 1 ].setMap( null );
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
      if ( !this.icon ) {
        this.icon = marker.getIcon();
      }
      marker.addListener( 'click', () => {
        marker.setAnimation( null );
        this.showInfo( marker, infoWindow );
      } );
      const key = marker.title.toLowerCase()
        .replace( / /g, '' );
      this.markers.set( key, marker );
    }
    this.map.fitBounds( bounds );
  }
  markPlace( place ) {
    const key = place.name.toLowerCase()
      .replace( / /g, '' );
    const marker = this.markers.get( key );
    for ( const marker of this.markers ) {
      marker[ 1 ].setIcon( this.icon );
      marker[ 1 ].setAnimation( null );
    }
    marker.setIcon( this.altIcon );
    marker.setAnimation( this.base.Animation.BOUNCE );
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
  altMarker( color = '0000ff' ) {
    //borrowed from official google maps api documentation example and created from
    //https://developers.google.com/chart/image/docs/gallery/dynamic_icons#pins
    this.altIcon = new this.base.MarkerImage(
      `http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|${color}|40|_|%E2%80%A2` );
  }
}