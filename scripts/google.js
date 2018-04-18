/*
 *GoogleMap defines behaviours for operations on the map
 *It defines
 * Place Markers
 * Marker stylers
 * Marker Listeners
 * Marker setters and resetters
 *Used by the App to facilitate use of a google map
 */
class GoogleMap {
  constructor() {
    this.container = document.querySelector( '#map' );
  }
  //When the app sets a list of locations, grab them
  set _locations( places ) {
    //Reset and delete previously set markers
    this.resetMarkers();
    //Define a LatLng object for each place
    for ( const place of places ) {
      this.markables.set( place, {
        lat: place.location.lat,
        lng: place.location.lng
      } );
    }
    //Mark places
    this.markPlaces();
  }
  /*
   *@init centers the map, applies default styles and defines an icon
   *for a highlightable marker
   */
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
  /*
   *@layout draws the map on load
   */
  layout() {
    const map = new this.base.Map( this.container, this.config );
    this.map = map;
    return this;
  }
  /*
   *@resetMarkers refreshes the map and deletes stale markers
   */
  resetMarkers() {
    this.markables.clear();
    for ( const marker of this.markers ) {
      marker[ 1 ].setMap( null );
    }
    this.markers.clear();
  }
  /*
   *@markPlaces places markers on the map
   *creates an infoWindow for each marker
   *binds the map to be centered around list of places
   */
  markPlaces() {
    //create infoWindow
    const infoWindow = new this.base.InfoWindow();
    //get current bounds
    const bounds = new this.base.LatLngBounds();
    //loop through list of markable locations
    for ( const markable of this.markables ) {
      //create a marker
      const marker = new this.base.Marker( {
        title: markable[ 0 ].name,
        map: this.map,
        position: markable[ 1 ],
        animation: this.base.Animation.DROP
      } );
      //add location to the bindable set of locations
      //around which the map centers itself
      bounds.extend( marker.position );
      //grab the default marker icon
      if ( !this.icon ) {
        this.icon = marker.getIcon();
      }
      //Add a listener to open the infoWindow
      marker.addListener( 'click', () => {
        marker.setAnimation( null );
        this.showInfo( marker, infoWindow );
      } );
      //Push marker to a set of markers that go stale
      //On next user input, and may need flushing off
      const key = marker.title.toLowerCase()
        .replace( / /g, '' );
      this.markers.set( key, marker );
    }
    //center the map
    this.map.fitBounds( bounds );
  }
  /*
   *@markPlace marks a single place on the map
   *If the place is already marked, the marker is
   *highlighted blue, and bounced
   */
  markPlace( place ) {
    const key = place.name.toLowerCase()
      .replace( / /g, '' );
    //Is the marker already placed?
    const marker = this.markers.get( key );
    //Only this marker needs highlighting
    //So, reset icons of all other markers
    for ( const marker of this.markers ) {
      marker[ 1 ].setIcon( this.icon );
      marker[ 1 ].setAnimation( null );
    }
    //highlight this marker
    marker.setIcon( this.altIcon );
    //bounce
    marker.setAnimation( this.base.Animation.BOUNCE );
  }
  // This function populates the infowindow when the marker is clicked. We'll only allow
  // one infowindow which will open at the marker that is clicked, and populate based
  // on that markers position.
  showInfo( marker, infowindow ) {
    // Check to make sure the infowindow is not already opened on this marker.
    if ( infowindow.marker !== marker ) {
      infowindow.marker = marker;
      infowindow.setContent( `<div class='info-window'><h4>${marker.title}</h4></div>` );
      infowindow.open( this.map, marker );
      // Make sure the marker property is cleared if the infowindow is closed.
      infowindow.addListener( 'closeclick', function () {
        infowindow.setMarker = null;
      } );
    }
  }
  //build an icon from googl's chart API
  altMarker( color = '0000ff' ) {
    //borrowed from official google maps api documentation example and created from
    //https://developers.google.com/chart/image/docs/gallery/dynamic_icons#pins
    this.altIcon = new this.base.MarkerImage(
      `https://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|${color}|40|_|%E2%80%A2` );
  }
}