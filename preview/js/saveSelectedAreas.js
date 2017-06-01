'use strict';

var areas = [];
var areaBounds = [];
var screenBounds = [];
var areaUrls = [];
var savedAreasWindow = document.getElementById('saved-areas-window-inner');

savedAreasWindow.onclick = function (e) {
  if (e.srcElement.nodeName === 'IMG') {
    var targetId = Number(e.srcElement.id.split('-')[2]);
    var boundsBase = areaBounds[targetId];
    var screenBoundsBase = screenBounds[targetId];
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
}

function getAreasInLocalStorage() {
  areaUrls = JSON.parse(localStorage.getItem('mable-preview-areas')).areaUrls || [];
  areaBounds = JSON.parse(localStorage.getItem('mable-preview-areas')).areaBounds || [];
  screenBounds = JSON.parse(localStorage.getItem('mable-preview-areas')).screenBounds || [];
  areaUrls.forEach(function (url, i) {
    var img = document.createElement("img");
    img.src = url;
    areas.push(img);
  });

  renderSavedAreaToWindow(areas);
}

function addSavedAreaToWindow(url, bounds) {
  var img = document.createElement("img");
  img.src = url;

  areas.push(img);
  areaUrls.push(url);
  areaBounds.push([bounds._sw.lng, bounds._sw.lat, bounds._ne.lng, bounds._ne.lat]);
  screenBounds.push([currentExportScreenBounds._sw.lng, currentExportScreenBounds._sw.lat, currentExportScreenBounds._ne.lng, currentExportScreenBounds._ne.lat]);
  if (areas.length > 6) {
    areas.shift();
    areaUrls.shift();
    areaBounds.shift();
    screenBounds.shift();
  }

  renderSavedAreaToWindow(areas);
}

function renderSavedAreaToWindow(domArray) {
  savedAreasWindow.textContent = null;
  domArray.forEach(function (a, i) {
    a.id = 'saved-area-' + i;
    savedAreasWindow.appendChild(a);
  });

  localStorage.setItem('mable-preview-areas', JSON.stringify({ 'areaUrls': areaUrls, 'areaBounds': areaBounds, 'screenBounds': screenBounds }));
}

getAreasInLocalStorage();