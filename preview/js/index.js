'use strict';

// global variables
var map;
var dragRotateHandler;
var currentExportBounds;
var currentExportScreenBounds;
var mableAPIDomain = 'https://dev.mable.me';
var gotStreets = false;
var exportAreaId = 'export-area';
var exportAreaInnerId = 'export-area-inner';
var exportBtnId = 'export-btn';
var switchViewBtnId = 'switch-view-btn';
var downloadImgBtnId = 'download-img-btn';
var downloadPNGBtnId = 'download-png-btn';
var downloadSVGBtnId = 'download-svg-btn';

// background image
var bgType = 'table'; // table | coaster
var backgroundImageUrl, osm2pngUrlParamsText, previewUrlParamsText;
getBackgroundTypefromUrl();
document.getElementById(exportAreaInnerId).classList.add(bgType);
if (bgType === 'table') {
  backgroundImageUrl = 'img/table-bg.png';
  osm2pngUrlParamsText = '&format=png';
  previewUrlParamsText = '&format=png&bg=1';
} else if (bgType === 'coaster') {
  backgroundImageUrl = 'img/coaster-bg.png';
  osm2pngUrlParamsText = '&format=png&mask=2';
  previewUrlParamsText = '&format=png&bg=2&mask=2';
}

// props to initialize this app
var mapProps = {
  container: 'map',
  //style: 'mapbox://styles/mapbox/dark-v9',
  style: 'mapbox://styles/mapbox/light-v9',
  center: [139.692101, 35.689634],
  zoom: 12.5,
  dragRotate: false
};
var streetsLayerProps = {
  id: 'osm2png'
};
var backgroundImageProps = {
  id: 'table-bg',
  url: backgroundImageUrl,
  opacity: 0.85
};
var minDownloadableZoom = 11;

// token for Mapbox GL JS
mapboxgl.accessToken = 'pk.eyJ1Ijoic2hhbmVjYXZhbGllcmUiLCJhIjoib0VGcnZCOCJ9.RY2Dhob09djoIsObhsJMvA';

console.log('%c□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□\r\n□■□□□□□■□□□□□□□□□□□■■□□□□□□□□■■■■□□□□□□□□□□□□\r\n□■■□□□■■□□□□□□□□□□□□■□□□□□□□□□□□■□□□□□□□□□□□□\r\n□■□■□■□■□□□□□□□□□□□□■□□□□□□□□□□□■□□□□□□□□□□□□\r\n□■□■□■□■□□□□□□□□□□□□■□□□□□□□□□□□■□□□□□□□□□□□□\r\n□■□■□■□■□□□□■■■■□□□□■■■■□□□□□□□□■□□□□□□■■■□□□\r\n□■□□■□□■□□□■□□□□■□□□■□□□■□□□□□□□■□□□□□■□□□■□□\r\n□■□□■□□■□□□□□□□□■□□□■□□□□■□□□□□□■□□□□■□□□□□■□\r\n□■□□■□□■□□□□■■■■■□□□■□□□□■□□□□□□■□□□□■■■■■■■□\r\n□■□□□□□■□□□■□□□□■□□□■□□□□■□□□□□□■□□□□■□□□□□□□\r\n□■□□□□□■□□■□□□□□■□□□■□□□□■□□□□□□■□□□□■□□□□□□□\r\n□■□□□□□■□□■□□□□□■□□□■□□□□■□□□□□□■□□□□■□□□□□■□\r\n□■□□□□□■□□■□□□□■■□□□■□□□■□□□□□□□■□□□□□■□□□□■□\r\n□■■□□□■■□□□■■■■□■■□□■■■■□□□□■■■■■■■■□□□■■■■□□\r\n□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□\r\n\r\nJoin us? mable.proj@gmail.com', 'font-family:Catamaran,Helvetica,Arial,sans-serif;font-size:12px;color:#54d08e;');

////////////////////////// Map View //////////////////////////

// [Get Streets] button onclick event
document.getElementById(exportBtnId).onclick = function () {
  var currentExportAreaBounds = getExportBounds();
  var zoom = map.getZoom();

  document.getElementById(exportAreaInnerId).classList.add('loading');

  if (currentExportAreaBounds._ne.lng >= -180 || currentExportAreaBounds._sw.lng <= 180 || zoom < minDownloadableZoom) {
    currentExportBounds = getExportBounds();
    currentExportScreenBounds = map.getBounds();
    updateTableImage(currentExportBounds);
    if (gotStreets === false) {
      gotStreets = true;
      getStreetsPNGInBounds(currentExportBounds);
    } else {
      updateStreetsPNGInBounds(currentExportBounds);
    }
    showBasemap();
  }
};

// [SWITCH VIEW] button onclick event
document.getElementById(switchViewBtnId).onclick = function () {
  var visibility = map.getLayoutProperty(backgroundImageProps.id, 'visibility');
  // switch a view (map <=> table)
  if (visibility === 'visible') {
    setMapView();
  } else {
    setTableView();
  }
};

// [DOWNLOAD] > [Preview Image (PNG)] button onclick event
document.getElementById(downloadPNGBtnId).onclick = function () {
  var hash = location.hash;
  getTablePNG();
  setTimeout(function () {
    location.hash = hash;
  }, 500);
};

// [DOWNLOAD] > [Vector Image (SVG)] button onclick event
document.getElementById(downloadSVGBtnId).onclick = function () {
  var hash = location.hash;
  alert('We are currently developing this feature, coming soon! Please feel free to contact us if you want to buy the data.');
  setTimeout(function () {
    location.hash = hash;
  }, 500);
};

// get background type from URL hash
function getBackgroundTypefromUrl() {
  var urlParams = location.hash.substring(1).split('&');
  for (var i=0; urlParams[i]; i++) {
      var param = urlParams[i].split('=');
      if (param[0] === 'bgType') {
          bgType = param[1];
      }
  }
}

// get map props from URL hash
function getMapPropsfromUrl() {
  var center = [];
  var zoom = null;
  var urlParams = location.hash.substring(1).split('&');
  var hasMapHash = false;
  var hasPreviewHash = false;
  for (var i=0; urlParams[i]; i++) {
      var param = urlParams[i].split('=');
      if (param[0] === 'map') {
          var mapParamsArray = param[1].split('/');
          mapProps.center = [mapParamsArray[2], mapParamsArray[1]];
          mapProps.zoom = mapParamsArray[0];
          hasMapHash = true;
      }
      if (param[0] === 'preview') {
        hasPreviewHash = true;
      }
  }
  if (hasMapHash === false) {
    getUserLocation();
  } else {
    initMap(hasPreviewHash);
  }
}

function setMapView() {
  map.setLayoutProperty(backgroundImageProps.id, 'visibility', 'none');
  activateGetStreetsViews();
  document.getElementById(exportAreaId).style.display = 'flex';
  document.getElementById(exportBtnId).style.display = 'flex';
    document.getElementById('saved-areas-window').style.display = 'flex'; // history.js
  document.getElementById(downloadImgBtnId).classList.add('disabled');
  showBasemap();
  map.dragRotate.disable();
  map.touchZoomRotate.disableRotation();
  map.setBearing(0);
  map.setPitch(0);
  map.fitBounds(currentExportScreenBounds, {
    linear: true
  });
}

function setTableView(bounds) {
  map.fitBounds(bounds || currentExportScreenBounds, {
    linear: true
  });
  setTimeout(function () {
    updateUrlMapProps(true);
    map.setLayoutProperty(backgroundImageProps.id, 'visibility', 'visible');
    deactivateGetStreetsViews();
    document.getElementById(exportAreaId).style.display = 'none';
    document.getElementById(exportBtnId).style.display = 'none';
    document.getElementById('saved-areas-window').style.display = 'none'; // history.js
    document.getElementById(downloadImgBtnId).classList.remove('disabled');
    hideBasemap();
    map.dragRotate.enable();
    map.touchZoomRotate.enableRotation();
  }, 1000);
}

function getUserLocation() {
  initMap(false);
  // HTTPS 対応後に↑を削除、↓のコメントアウト外す
  /*if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (pos) {
      console.log(pos.coords);
      mapProps.center = [pos.coords.longitude, pos.coords.latitude];
      initMap(false);
    }, function () {
      alert('現在地を取得できませんでした');
      initMap(false);
    });
  } else {
    alert('現在地を取得できませんでした');
    initMap(false);
  }*/
}

// update URL hash
function updateUrlMapProps(isPreview) {
  if (map.getLayoutProperty(backgroundImageProps.id, 'visibility') !== 'visible') {
    var center = map.getCenter();
    var zoom = map.getZoom();
    location.hash= 'map=' + zoom + '/' + center.lat + '/' + center.lng;
  }
  if (isPreview === true) {
    location.hash= 'map=' + zoom + '/' + center.lat + '/' + center.lng + '&bgType=' + bgType + '&preview';
  }
}

// check longitude if not exceeded |180|
function checkLngOver180andZoom() {
  if (map.getLayoutProperty(backgroundImageProps.id, 'visibility') !== 'visible') {
    var currentExportAreaBounds = getExportBounds();
    var zoom = map.getZoom();
    if (currentExportAreaBounds._ne.lng < -180 || currentExportAreaBounds._sw.lng > 180 || zoom < minDownloadableZoom) {
      deactivateGetStreetsViews();
      return false;
    } else {
      activateGetStreetsViews();
      return true;
    }
  } else {
    return false;
  }
}

// initialize controls
function initControls() {
  var geocoder = new MapboxGeocoder({ accessToken: mapboxgl.accessToken, flyTo: false });

  map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
  map.addControl(geocoder, 'bottom-left');

  geocoder.on('result', function(e) {
    console.log('result: ', e.result.center);
    map.panTo(e.result.center);
  });
}

// create a map
function initMap(isPreview) {
  map = new mapboxgl.Map(mapProps);

  map.touchZoomRotate.disableRotation();

  initControls();

  map.on('load', function () {
    currentExportBounds = getExportBounds();
    currentExportScreenBounds = map.getBounds();
    getTableImage(currentExportBounds);
    checkLngOver180andZoom();
    /*if (checkLngOver180andZoom() === true) {
      getStreetsPNGInBounds(currentExportBounds);
    };*/

    // initialize a tooltip for [GET STREETS] button
    $('#export-btn').tooltip({
      placement: 'bottom',
      title: 'Click it for clipping streets!'
    });
    $('#export-btn').tooltip('show');
    /*setTimeout(function () {
      $('#export-btn').tooltip('destroy');
    }, 5000);*/
    $('#export-btn').on('mouseover', function () {
      $('#export-btn').tooltip('destroy');
    });

    if (isPreview === true) {
      gotStreets = true;
      getStreetsPNGInBounds(currentExportBounds);
      $('#export-btn').tooltip('destroy');
      setTableView();
    }

    // for SotM 2017!!
    addPictureMarker('http://2017.stateofthemap.org/img/logo-dark.svg', 80, 120, 0, 0, [139.93588, 37.484359999999995]);
  });

  /*map.on('dragend', updateUrlMapProps);
  map.on('zoomend', updateUrlMapProps);*/
  map.on('move', function () {
    checkLngOver180andZoom();
  });
  map.on('moveend', function () {
    updateUrlMapProps(false);
  });
}

// calculate coordinates of bounds
function getExportBounds() {
  var boundsElem = document.getElementById(exportAreaInnerId);
  var rect = boundsElem.getBoundingClientRect();

  // pixel to lnglat
  var ne = map.unproject([rect.left + rect.width, rect.top]);
  var sw = map.unproject([rect.left, rect.top + rect.height]);

  return new mapboxgl.LngLatBounds(sw, ne);
}

// add streets into map with our OSM API
function getStreetsPNGInBounds(bounds, doNotSave) {
  document.getElementById(exportAreaInnerId).classList.remove('loading');
  document.getElementById(exportAreaInnerId).classList.add('shutter');
  document.getElementById(switchViewBtnId).style.display = 'block';

  var bboxParamText = 'bbox=' + bounds._sw.lng + ',' + bounds._sw.lat + ',' + bounds._ne.lng + ',' + bounds._ne.lat;
  var bboxCoordinates = [[bounds._sw.lng, bounds._ne.lat], [bounds._ne.lng, bounds._ne.lat], [bounds._ne.lng, bounds._sw.lat], [bounds._sw.lng, bounds._sw.lat]];
  var imgUrl = mableAPIDomain + '/osm2svg?' + bboxParamText + '&width=709&style=road&credit=no' + osm2pngUrlParamsText;

  map.addSource(streetsLayerProps.id, {
    'type': 'image',
    'url': imgUrl,
    'coordinates': bboxCoordinates
  });
  map.addLayer({
    'id': streetsLayerProps.id,
    'type': 'raster',
    'source': streetsLayerProps.id
  });

  if (doNotSave === undefined) {
    addSavedAreaToWindow(imgUrl, bounds); // historys.js
  }

  setTimeout(function () {
    document.getElementById(exportAreaInnerId).classList.remove('shutter');
  }, 800);
}

// re-add streets into map with our OSM API
function updateStreetsPNGInBounds() {
  var bounds = getExportBounds();
  map.removeLayer(streetsLayerProps.id);
  map.removeSource(streetsLayerProps.id);
  getStreetsPNGInBounds(bounds);
}

// add a table image into map
function getTableImage(bounds) {
  var bboxParamText = 'bbox=' + bounds._sw.lng + ',' + bounds._sw.lat + ',' + bounds._ne.lng + ',' + bounds._ne.lat;
  var bboxCoordinates = [[bounds._sw.lng, bounds._ne.lat], [bounds._ne.lng, bounds._ne.lat], [bounds._ne.lng, bounds._sw.lat], [bounds._sw.lng, bounds._sw.lat]];

  map.addSource(backgroundImageProps.id, {
    'type': 'image',
    'url': backgroundImageProps.url,
    'coordinates': bboxCoordinates
  });
  map.addLayer({
    'id': backgroundImageProps.id,
    'type': 'raster',
    'source': backgroundImageProps.id,
    'layout': {
      'visibility': 'none'
    },
    'paint': {
      'raster-opacity': backgroundImageProps.opacity
    }
  });
}

// re-add a table image into map
function updateTableImage(bounds) {
  var tableBounds = bounds || getExportBounds();
  map.removeLayer(backgroundImageProps.id);
  map.removeSource(backgroundImageProps.id);
  getTableImage(tableBounds);
}

// show a basemap
function showBasemap() {
  var layers = map.style._layers;
  for (var key in layers) {
    if (key !== streetsLayerProps.id && key !== backgroundImageProps.id) {
      map.setLayoutProperty(key, 'visibility', 'visible');
    }
  }
}

// hide a basemap
function hideBasemap() {
  var layers = map.style._layers;
  for (var key in layers) {
    if (key !== streetsLayerProps.id && key !== backgroundImageProps.id) {
      map.setLayoutProperty(key, 'visibility', 'none');
    }
  }
}

// show elements as bbox and button to get streets
function activateGetStreetsViews() {
  //document.getElementById(exportAreaId).style.display = 'flex';
  //document.getElementById(exportBtnId).style.display = 'block';
  document.getElementById(exportAreaInnerId).classList.remove('disabled');
  document.getElementById(exportBtnId).classList.remove('disabled');
}

// hide elements as bbox and button to get streets
function deactivateGetStreetsViews() {
  //document.getElementById(exportAreaId).style.display = 'none';
  //document.getElementById(exportBtnId).style.display = 'none';
  document.getElementById(exportAreaInnerId).classList.add('disabled');
  document.getElementById(exportBtnId).classList.add('disabled');
}

getMapPropsfromUrl();
//initMap();


////////////////////////// Table View //////////////////////////



////////////////////////// Console Tools //////////////////////////

// getSVG(): download SVG file within selected bounds.

// add streets into map with our OSM API
function getSVG() {
  var bounds = currentExportBounds;
  var bboxParamText = 'bbox=' + bounds._sw.lng + ',' + bounds._sw.lat + ',' + bounds._ne.lng + ',' + bounds._ne.lat;
  var bboxCoordinates = [[bounds._sw.lng, bounds._ne.lat], [bounds._ne.lng, bounds._ne.lat], [bounds._ne.lng, bounds._sw.lat], [bounds._sw.lng, bounds._sw.lat]];
  var requestUrl = mableAPIDomain + '/osm2svg?' + bboxParamText + '&width=709&style=road&format=svg';
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
        console.log('interactive... '+xhr.responseText.length+' bytes.');
        break;
      case 4:
        if( xhr.status == 200 || xhr.status == 304 ) {
          var data = xhr.responseText;
          downloadImage(data, requestUrl, 'image/svg+xml');
          console.log('COMPLETE!');
          //console.log(data);
        } else {
          console.log('Failed. HttpStatus: ' + xhr.statusText);
        }
        break;
    }
  };
  xhr.open('GET', requestUrl, false);
  xhr.send();
  //xhr.abort();
}

// add streets into map with our OSM API
function getTablePNG() {
  document.getElementById(downloadImgBtnId).innerHTML = '<img src="img/download.svg" style="height:11px;width:13.78px;"> Download <span class="caret"></span>';
  var imgSrc;
  var bounds = currentExportBounds;
  var bboxParamText = 'bbox=' + bounds._sw.lng + ',' + bounds._sw.lat + ',' + bounds._ne.lng + ',' + bounds._ne.lat;
  var bboxCoordinates = [[bounds._sw.lng, bounds._ne.lat], [bounds._ne.lng, bounds._ne.lat], [bounds._ne.lng, bounds._sw.lat], [bounds._sw.lng, bounds._sw.lat]];
  var requestUrl = mableAPIDomain + '/osm2svg?' + bboxParamText + '&width=709&style=road' + previewUrlParamsText;
  var xhr = new XMLHttpRequest();
  xhr.open('GET', requestUrl, true);
  xhr.responseType = "arraybuffer";
  xhr.onload = function() {
    document.getElementById(downloadImgBtnId).innerHTML = '<i class="fa fa-cloud-download" aria-hidden="true"></i> Download <span class="caret"></span>';
    downloadImage(this.response, requestUrl, 'image/png');
  };
  xhr.send();
}

// create and download SVG file
function downloadImage(content, url, type) {
  var fileName = 'mable';
  var blob = new Blob([content], { 'type': type });
  var url = window.URL.createObjectURL(blob);
  var a = document.createElement('a');
  document.body.appendChild(a);
  a.style.display = 'none';
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
}

// add 3D buildings on a map
function addBld() {
  // the 'building' layer in the mapbox-streets vector source contains building-height
  // data from OpenStreetMap.
  map.addLayer({
    'id': '3d-buildings',
    'source': 'composite',
    'source-layer': 'building',
    'filter': ['==', 'extrude', 'true'],
    'type': 'fill-extrusion',
    'paint': {
        'fill-extrusion-color': '#54d08e',
        'fill-extrusion-height': {
            'type': 'identity',
            'property': 'height'
        },
        'fill-extrusion-base': {
            'type': 'identity',
            'property': 'min_height'
        },
        'fill-extrusion-opacity': .5
    }
  });
}

// remove 3D buildings
function removeBld() {
  map.removeLayer('3d-buildings');
}

// experimental: add text on a map
function addText(text, fontFamily, fontSize, color, xOffset, yOffset) {
  var coordinates = [0, 0];
  var urlParams = location.hash.substring(1).split('&');
  var offset = [xOffset || 0, yOffset || 0];

  // create a DOM element for the marker
  var el = document.createElement('div');
  el.className = 'text-marker';
  el.innerHTML = text;
  el.style.width = '100%';
  el.style.height = fontSize + 'px';
  el.style.fontFamily = fontFamily;
  el.style.fontSize = fontSize + 'px';
  el.style.color = color;

  for (var i=0; urlParams[i]; i++) {
      var param = urlParams[i].split('=');
      if (param[0] === 'map') {
          var mapParamsArray = param[1].split('/');
          coordinates = [mapParamsArray[2], mapParamsArray[1]];
      }
  }

  // add marker to map
  new mapboxgl.Marker(el, {offset: [-fontSize * el.innerText.length / 4 + offset[0], -fontSize / 2 + offset[1]]})
    .setLngLat(coordinates)
    .addTo(map);
}

// experimental: add a picture marker on a map
function addPictureMarker(imgUrl, height, width, xOffset, yOffset, coords) {
  var coordinates = [0, 0];
  var urlParams = location.hash.substring(1).split('&');
  var offset = [xOffset || 0, yOffset || 0];

  // create a DOM element for the marker
  var el = document.createElement('div');
  el.className = 'picture-marker';
  el.innerHTML = '<img src="' + imgUrl + '" width="' + width + '" height="' + height + '">';

  if (coords !== undefined) {
    coordinates = coords;
  } else {
    for (var i=0; urlParams[i]; i++) {
        var param = urlParams[i].split('=');
        if (param[0] === 'map') {
            var mapParamsArray = param[1].split('/');
            coordinates = [mapParamsArray[2], mapParamsArray[1]];
        }
    }
  }

  // add marker to map
  new mapboxgl.Marker(el, {offset: [-width / 2 + offset[0], -height / 2 + offset[1]]})
    .setLngLat(coordinates)
    .addTo(map);
}