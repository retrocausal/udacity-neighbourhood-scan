const isReady = ( bindApp, stallApp ) => {
  document.addEventListener( 'readystatechange', ( event ) => {
    if ( document.readyState === "complete" ) {
      bindApp( new viewModel() );
    }
  } );
};

new Promise( isReady )
  .then( VM => {
    const drawers = document.querySelectorAll( '.drawer-handle' );
    const body = document.querySelector( 'BODY' );
    for ( const drawer of drawers ) {
      drawer.onclick = function () {
        body.classList.toggle( 'off-canvas-ui' );
      };
    }
    ko.applyBindings( VM );
  } )