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
    this.currentListOfVenues.clear();
    this.geocodables.clear();
    //Define a LatLng object for each place
    for ( const place of places ) {
      this.currentListOfVenues.add( place );
      if ( !this.geocodedPlaces.has( place ) ) {
        this.geocodables.add( place );
      }
    }
    //rewrite latlngs
    this.geocode()
      .then( _ => {
        //Reset and delete previously set markers
        this.resetMarkers();
        //Mark places
        this.markPlaces();
      } )
      .catch( exception => {
        console.warn( exception );
      } );
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
    this.geocodedPlaces = new Set();
    this.geocodables = new Set();
    this.currentListOfVenues = new Set();
    this.altMarker();
    this.icon = false;
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
    for ( const marker of this.markers ) {
      if ( !this.currentListOfVenues.has( marker[ 0 ] ) ) {
        marker[ 1 ].setMap( null );
      }
    }
  }
  /*
   *@geocode geocodes a place returned by foursquare for accuracy reasons
   *foursquare's API gives me inaccurate per google map lat lng
   *hence, correct with a geocode search below
   */
  geocode() {
    let promises = new Set();
    //init geocoder
    const gCoder = new this.base.Geocoder();
    let geocodables = new Set();
    //loop through foursquare returned set of places
    for ( const place of this.geocodables ) {
      //Build an address string to geocode
      const address = `${place.location.address} ${place.location.city} ${place.location.state} ${place.location.postalCode} ${place.location.country}`;
      //gather component restrictions and other regional biases
      const name = place.name;
      const postalCode = place.location.postalCode;
      const geocoder = {
        address: address,
        componentRestrictions: {
          locality: 'New York',
          country: 'US',
          postalCode: postalCode
        },
        region: 'us'
      };
      //define personal per place handlers for geocoding
      const applyGeocode = ( location ) => {
        const markable = {
          lat: location.lat(),
          lng: location.lng()
        }
        this.markables.set( place, markable );
        this.geocodedPlaces.add( place );
      };
      const asyncMapMark = ( resolve ) => {
        gCoder.geocode( geocoder, ( results, status ) => {
          if ( results && status === this.base.GeocoderStatus.OK ) {
            //Place found!!! apply changes to foursquare's latlng
            const location = results[ 0 ].geometry.location;
            applyGeocode( location );
          } else {
            //Place not found??? well use foursquare's latlng
            const markable = {
              lat: place.location.lat,
              lng: place.location.lng
            };
            this.markables.set( place, markable );
          }
          resolve();
        } );
      };
      //re confirm that we are not duplicating these efforts to geocode
      //If not, begin an async geocode process
      if ( !this.geocodedPlaces.has( place ) ) {
        const myPromise = new Promise( asyncMapMark );
        promises.add( myPromise );
      }
    }
    //If there was geocoding, await finish elese resolve immediately
    return ( promises.size ) ? Promise.all( promises ) : Promise.resolve();
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
      const place = markable[ 0 ];
      let marker;
      if ( !this.markers.get( place ) ) {
        //create a marker
        marker = new this.base.Marker( {
          title: place.name,
          position: markable[ 1 ],
          animation: this.base.Animation.DROP
        } );
        //Add a listener to open the infoWindow
        marker.addListener( 'click', () => {
          marker.setAnimation( null );
          this.showInfo( marker, infoWindow, place );
        } );
        //Push marker to a set of markers that go stale
        //On next user input, and may need flushing off
        this.markers.set( place, marker );
        //grab the default marker icon
        if ( this.icon === false ) {
          this.icon = marker.getIcon();
        }
      } else {
        marker = this.markers.get( place );
      }
      if ( this.currentListOfVenues.has( place ) ) {
        //add location to the bindable set of locations
        //around which the map centers itself
        bounds.extend( marker.position );
        marker.setMap( this.map );
      }
    }
    //center the map
    this.map.fitBounds( bounds );
  }
  /*
   *@highlightPlace highlights a single place on the map
   *highlighted blue, and bounced
   */
  highlightPlace( place ) {
    //Only this marker needs highlighting
    //So, reset icons of all other markers
    for ( const marker of this.markers ) {
      if ( marker[ 0 ] === place ) {
        //highlight this marker
        marker[ 1 ].setIcon( this.altIcon );
        marker[ 1 ].setAnimation( this.base.Animation.BOUNCE );
        //center map
        const center = marker[ 1 ].getPosition();
        this.map.setCenter( center );
      } else {
        marker[ 1 ].setIcon( this.icon );
        marker[ 1 ].setAnimation( null );
      }
    }
  }
  // This function populates the infowindow when the marker is clicked. We'll only allow
  // one infowindow which will open at the marker that is clicked, and populate based
  // on that markers position.
  showInfo( marker, infowindow, place ) {
    // Check to make sure the infowindow is not already opened on this marker.
    if ( infowindow.marker !== marker ) {
      infowindow.marker = marker;
      infowindow.setContent( `<div class='info-window'><h4>${marker.title}</h4></div>` );
      infowindow.open( this.map, marker );
      // Make sure the marker property is cleared if the infowindow is closed.
      infowindow.addListener( 'closeclick', function () {
        infowindow.marker = null;
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