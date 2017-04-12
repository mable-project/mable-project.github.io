'use strict';

// token for Mapbox GL JS
mapboxgl.accessToken = 'pk.eyJ1Ijoic2hhbmVjYXZhbGllcmUiLCJhIjoib0VGcnZCOCJ9.RY2Dhob09djoIsObhsJMvA';

// Mapillary
var mapillaryClientId = 'bEN2c0tOTS1Oc1FTWWxVbm1QYVRnZzo2ZjFiZjA5ZTczOTQzYjVm';

// Firebase Connection
var db = firebase.database();
var dbRef = db.ref("/camera");

// props
var props = {};
props.bearing = 0;
props.location = [139.69993333561428, 35.65948608243135];

var pKey = 'e-1bXMnDxzD4F6ubkQoJJQ';
var clickPointPKey;
getPKeyfromUrl();

console.log('%c□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□\r\n□■□□□□□■□□□□□□□□□□□■■□□□□□□□□■■■■□□□□□□□□□□□□\r\n□■■□□□■■□□□□□□□□□□□□■□□□□□□□□□□□■□□□□□□□□□□□□\r\n□■□■□■□■□□□□□□□□□□□□■□□□□□□□□□□□■□□□□□□□□□□□□\r\n□■□■□■□■□□□□□□□□□□□□■□□□□□□□□□□□■□□□□□□□□□□□□\r\n□■□■□■□■□□□□■■■■□□□□■■■■□□□□□□□□■□□□□□□■■■□□□\r\n□■□□■□□■□□□■□□□□■□□□■□□□■□□□□□□□■□□□□□■□□□■□□\r\n□■□□■□□■□□□□□□□□■□□□■□□□□■□□□□□□■□□□□■□□□□□■□\r\n□■□□■□□■□□□□■■■■■□□□■□□□□■□□□□□□■□□□□■■■■■■■□\r\n□■□□□□□■□□□■□□□□■□□□■□□□□■□□□□□□■□□□□■□□□□□□□\r\n□■□□□□□■□□■□□□□□■□□□■□□□□■□□□□□□■□□□□■□□□□□□□\r\n□■□□□□□■□□■□□□□□■□□□■□□□□■□□□□□□■□□□□■□□□□□■□\r\n□■□□□□□■□□■□□□□■■□□□■□□□■□□□□□□□■□□□□□■□□□□■□\r\n□■■□□□■■□□□■■■■□■■□□■■■■□□□□■■■■■■■■□□□■■■■□□\r\n□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□\r\n\r\nJoin us? mable.proj@gmail.com', 'font-family:Catamaran,Helvetica,Arial,sans-serif;font-size:12px;color:#54d08e;');

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v8',
    center: props.location,
    zoom: 15,
    pitch: 60
});

var markerSource = {
    type: 'geojson',
    data: {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: props.location,
        },
        properties: { },
    },
};

var popup = new mapboxgl.Popup();

map.on('style.load', function() {
    var mapillarySource = {
        type: 'vector',
        tiles: ['https://d25uarhxywzl1j.cloudfront.net/v0.1/{z}/{x}/{y}.mvt'],
        minzoom: 0,
        maxzoom: 14
    };
    map.addSource('mapillary', mapillarySource);
    map.addLayer({
        'id': 'mapillary',
        'type': 'line',
        'source': 'mapillary',
        'source-layer': 'mapillary-sequences',
        'layout': {
            'line-cap': 'round',
            'line-join': 'round'
        },
        'paint': {
            'line-opacity': 0.6,
            'line-color': '#54d08e',
            'line-width': 5
        }
    });

    map.addSource('markers', markerSource);
    map.addLayer({
        id: 'markers',
        type: 'symbol',
        source: 'markers',
        layout: {
            'icon-image': '{marker-symbol}-15',
        },
    });
});

map.on('click', function (e) {
    console.log(e);
    $.ajax('https://a.mapillary.com/v3/images/?closeto=' + e.lngLat.lng + ',' + e.lngLat.lat + '&radius=100&per_page=1&client_id=' + mapillaryClientId + '').done(function(res) {
        console.log(res);
        clickPointPKey = res.features[0].properties.key;
        popup.setLngLat([e.lngLat.lng, e.lngLat.lat])
            .setHTML('<div id="popup-content"><img id="img-on-popup" src="https://d1cuyjsrcm0gby.cloudfront.net/' + res.features[0].properties.key + '/thumb-320.jpg" height="90" width="120" onClick="moveToClickPoint()" ><span id="loading-on-popup"></span></div>')
            .addTo(map);
    });
});

var mly = new Mapillary.Viewer(
    'mly',
    mapillaryClientId,
    pKey);

var marker;
mly.on(Mapillary.Viewer.nodechanged, function (node) {
    var lngLat = [node.latLon.lon, node.latLon.lat];

    var data = {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: lngLat,
        },
        properties: {
            'marker-symbol': 'marker',
        }
    };

    map.getSource('markers').setData(data);
    console.log(lngLat);
    props.location = lngLat;
    dbRef.set({ bearing: props.bearing, longitude: lngLat[0], latitude: lngLat[1] });
    map.flyTo({ center: lngLat });
});

mly.on(Mapillary.Viewer.bearingchanged, function (bearing) {
  console.log(bearing);
  props.bearing = bearing;
  dbRef.set({ bearing: bearing, longitude: props.location[0], latitude: props.location[1] });
});

window.addEventListener('resize', function() { mly.resize(); map.resize(); });

function moveToClickPoint() {
    console.log('click img');
    document.getElementById('popup-content').classList.add('loading');
    mly.moveToKey(clickPointPKey).then(function (n) {
        popup.remove();
    });
}

document.getElementById('goto-preview-btn').onclick = function () {
  location.href = '/preview/#map=12.5/' + props.location[1] + '/' + props.location[0];
};



// get map props from URL hash
function getPKeyfromUrl() {
  var urlParams = location.hash.substring(1).split('&');
  for (var i=0; urlParams[i]; i++) {
      var param = urlParams[i].split('=');
      if (param[0] === 'pKey') {
          pKey = param[1];
      }
  }
}