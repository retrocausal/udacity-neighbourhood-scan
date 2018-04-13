initMap = () => {
  const map = new google.maps.Map( document.getElementById( 'map' ), {
    center: {
      lat: 40.7413549,
      lng: -73.99802439999999
    },
    zoom: 13
  } );
};