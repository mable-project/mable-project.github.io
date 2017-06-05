'use strict';

var historyArray = []; // [{ dom: <>, areaBounds: <>, screenBounds: <>, areaUrl: <>, address: <> }]
var savedAreasWindowInner = document.getElementById('saved-areas-window-inner');
var savedAreasWindow = document.getElementById('saved-areas-window');
var ua = navigator.userAgent;

savedAreasWindowInner.onclick = function (e) {
  if (e.srcElement.nodeName === 'IMG') {
    var targetId = Number(e.srcElement.id.split('-')[2]);
    var boundsBase = historyArray[targetId].areaBounds;
    var screenBoundsBase = historyArray[targetId].screenBounds;
    var sw = new mapboxgl.LngLat(boundsBase[0], boundsBase[1]);
    var ne = new mapboxgl.LngLat(boundsBase[2], boundsBase[3]);
    var bounds = new mapboxgl.LngLatBounds(sw, ne);
    var screenSw = new mapboxgl.LngLat(screenBoundsBase[0], screenBoundsBase[1]);
    var screenNe = new mapboxgl.LngLat(screenBoundsBase[2], screenBoundsBase[3]);
    var sBounds = new mapboxgl.LngLatBounds(screenSw, screenNe);

    updateTableImage(bounds);
    if (gotStreets === false) {
        gotStreets = true;
    } else {
      map.removeLayer(streetsLayerProps.id);
      map.removeSource(streetsLayerProps.id);
    }
    getStreetsPNGInBounds(bounds, true);
    $('#export-btn').tooltip('destroy');
    setTableView(sBounds);

    currentExportBounds = bounds;
    currentExportScreenBounds = sBounds;
  }
  if (e.srcElement.nodeName === 'I') {
    var img = e.srcElement.previousSibling;
    var targetId = Number(img.id.split('-')[2]);
    historyArray.splice(targetId, 1);
    localStorage.setItem('mable-preview-history', JSON.stringify({ 'history': historyArray }));

    renderSavedAreaToWindow();
    updateBoundsFeatureCollection();
  }
}

if (ua.indexOf('iPhone') > 0 || ua.indexOf('iPod') > 0 || ua.indexOf('Android') > 0 && ua.indexOf('Mobile') > 0 || ua.indexOf('iPad') > 0 || ua.indexOf('Android') > 0) {
  $('.delete-thumbnail-icon').css('display', 'inline');
}

map.on('load', function () {
  getAreasInLocalStorage();
  savedAreasWindow.classList.add('visible');
});
map.on('move', function () {
  savedAreasWindow.classList.remove('visible');
});
map.on('moveend', function () {
  savedAreasWindow.classList.add('visible');
});

function createThumbnail(url) {
  var thumbnail = document.createElement('div');
  thumbnail.classList.add('savedarea-thumbnail');
  var img = document.createElement("img");
  img.src = url;
  img.setAttribute('data-toggle', 'tooltip');
  img.setAttribute('data-placement', 'bottom');
  var deleteIcon = document.createElement('i');
  deleteIcon.classList.add('fa');
  deleteIcon.classList.add('fa-close');
  deleteIcon.classList.add('delete-thumbnail-icon');
  deleteIcon.ariaHidden = true;

  thumbnail.appendChild(img);
  thumbnail.appendChild(deleteIcon);

  return thumbnail;
}

function getAreasInLocalStorage() {
  var historyInLocalStorage = JSON.parse(localStorage.getItem('mable-preview-history'));
  console.log(historyInLocalStorage);
  if (historyInLocalStorage) {
    historyInLocalStorage.history.forEach(function (h, i) {
      var history = {
        dom: createThumbnail(h.areaUrl),
        areaUrl: h.areaUrl,
        areaBounds: h.areaBounds,
        screenBounds: h.screenBounds,
        address: h.address
      };
      historyArray.push(history);
    });

    renderSavedAreaToWindow();
  };
  initBoundsFeatureCollection();
}

function addSavedAreaToWindow(url, bounds) {
  var elem = createThumbnail(url);
  var history = {
    dom: elem,
    areaUrl: url,
    areaBounds: [bounds._sw.lng, bounds._sw.lat, bounds._ne.lng, bounds._ne.lat],
    screenBounds: [currentExportScreenBounds._sw.lng, currentExportScreenBounds._sw.lat, currentExportScreenBounds._ne.lng, currentExportScreenBounds._ne.lat],
    address: ''
  };
  historyArray.push(history);
  if (historyArray.length > 6) {
    historyArray.shift();
  }

  //renderSavedAreaToWindow(areas);
  var center = map.getCenter();
  reverseGeocoding(center.lng, center.lat, elem, history);
}

function renderSavedAreaToWindow() {
  savedAreasWindowInner.textContent = null;
  historyArray.forEach(function (h, i) {
    var thumbnail = h.dom;
    thumbnail.childNodes.forEach(function (node) {
      if (node.nodeName === 'IMG') {
        node.id = 'saved-area-' + i;
        //console.log($('#' + node.id));
        $('#' + node.id).tooltip({ title: h.address, container: 'body' });
      }
    });
    savedAreasWindowInner.appendChild(thumbnail);
  });
  historyArray.forEach(function (h, i) {
    $('#' + 'saved-area-' + i).tooltip({ title: h.address, container: 'body' });
  });
}

function initBoundsFeatureCollection() {
  var fc = boundsToFeature();
  map.addSource('history', { type: 'geojson', data: fc });
  map.addLayer({
    'id': 'history',
    'type': 'fill',
    'source': 'history',
    'layout': {},
    'paint': {
      'fill-color': 'rgb(84,208,142)',
      'fill-opacity': 0.1,
      'fill-outline-color': 'rgb(84,208,142)'
    }
  });
}

function updateBoundsFeatureCollection() {
  var fc = boundsToFeature();
  map.getSource('history').setData(fc);
}

function boundsToFeature() {
  var fc = {
    type: 'FeatureCollection',
    features: []
  };
  historyArray.forEach(function (h, i) {
    var feature = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: boundsArrayToCoordinates(h.areaBounds)
      }
    };
    fc.features.push(feature);
  });

  //console.log(fc);
  return fc;
}

function boundsArrayToCoordinates(boundsArray) {
  return [[[boundsArray[0], boundsArray[1]], [boundsArray[0], boundsArray[3]], [boundsArray[2], boundsArray[3]], [boundsArray[2], boundsArray[1]], [boundsArray[0], boundsArray[1]]]];
}

function reverseGeocoding(lng, lat, elem, history) {
  var requestUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + lng + '%2C' + lat + '.json?access_token=' + mapboxgl.accessToken;
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    switch ( xhr.readyState ) {
      case 0:
        console.log('uninitialized!');
        break;
      case 1:
        console.log('loading...');
        break;
      case 2:
        console.log('loaded.');
        break;
      case 3:
        console.log('interactive... ' + xhr.responseText.length + ' bytes.');
        break;
      case 4:
        if( xhr.status == 200 || xhr.status == 304 ) {
          var data = JSON.parse(xhr.responseText);
          console.log('COMPLETE!');
          //addresses.push(data.features[0].text);
          history.address = data.features[0].place_name;
          localStorage.setItem('mable-preview-history', JSON.stringify({ 'history': historyArray }));
          renderSavedAreaToWindow();
          updateBoundsFeatureCollection();
        } else {
          console.log('Failed. HttpStatus: ' + xhr.statusText);
        }
        break;
    }
  };
  xhr.open('GET', requestUrl, false);
  xhr.send();
}