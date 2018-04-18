//isReady checks for DOMContentLoaded
const isReady = ( bindApp, stallApp ) => {
  document.addEventListener( 'readystatechange', ( event ) => {
    if ( document.readyState === "complete" ) {
      bindApp();
    }
  } );
};
//Create a promised initiation of the App
new Promise( isReady )
  .then( ready => {
    //Activate Hamburgers
    const drawers = document.querySelectorAll( '.drawer-handle' );
    const body = document.querySelector( 'BODY' );
    for ( const drawer of drawers ) {
      drawer.onclick = function () {
        body.classList.toggle( 'off-canvas-ui' );
      };
    }
    //Create new App
    init();
    //Place a script tag that downloads necessary things and draws a map
    const footer = document.querySelector( 'footer' );
    const gmap = document.createElement( 'script' );
    gmap.setAttribute( 'src', 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBEfoVyYTBKdQL2RmQ72luqf7GyUzXyN1g&libraries=drawing,geometry' );
    //Layout the map
    gmap.onload = function () {
      setTimeout( addPlotter, 1000 );
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
  } )