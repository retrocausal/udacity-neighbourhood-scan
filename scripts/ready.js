//isReady checks for DOMContentLoaded
const isReady = ( bindApp, stallApp ) => {
  document.addEventListener( 'readystatechange', ( event ) => {
    if ( document.readyState === "interactive" ) {
      bindApp();
    }
  } );
};
//Create a promised initiation of the App
new Promise( isReady )
  .then( ready => {
    //Place a script tag that downloads necessary things and draws a map
    const footer = document.querySelector( 'footer' );
    const gmap = document.createElement( 'script' );
    gmap.setAttribute( 'src', 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBnAnZgkPFVO23pfyvEq9VFxFZdybOIpEU&libraries=drawing,geometry' );
    //Layout the map
    gmap.onload = function () {
      addPlotter();
    };
    //Uh Oh! something went wrong. Inform the user
    gmap.onerror = function ( e ) {
      const error = document.createElement( 'DIV' );
      error.classList.add( 'error' );
      error.classList.add( 'error-msg' );
      error.classList.add( 'await-map' );
      error.innerHTML = `<span>Could not load google map</span>`;
      const map = document.querySelector( '#map' );
      map.innerHTML = '';
      map.appendChild( error );
    };
    footer.appendChild( gmap );
  } );