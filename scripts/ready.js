const isReady = ( bindApp, stallApp ) => {
  document.addEventListener( 'readystatechange', ( event ) => {
    if ( document.readyState === "complete" ) {
      bindApp();
    }
  } );
};

new Promise( isReady )
  .then( ready => {
    const drawers = document.querySelectorAll( '.drawer-handle' );
    const body = document.querySelector( 'BODY' );
    for ( const drawer of drawers ) {
      drawer.onclick = function () {
        body.classList.toggle( 'off-canvas-ui' );
      };
    }
    init();
    const footer = document.querySelector( 'footer' );
    const gmap = document.createElement( 'script' );
    gmap.setAttribute( 'src', 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBEfoVyYTBKdQL2RmQ72luqf7GyUzXyN1g&libraries=drawing,geometry' );
    gmap.onload = function () {
      setTimeout( addPlotter, 1000 );
      //return addPlotter();
    };
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