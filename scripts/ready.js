const isReady = ( bindApp, stallApp ) => {
  switch ( document.readyState ) {
  case "interactive":
    // The document has finished loading. We can now access the DOM elements.
    bindApp( new viewModel() );
    break;
  default:
    //do Nothing
  }
};

new Promise( isReady )
  .then( VM => {
    ko.applyBindings( VM );
  } )