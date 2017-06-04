'use strict';

var areas = [];
var areaBounds = [];
var screenBounds = [];
var areaUrls = [];
var addresses = [];
var savedAreasWindowInner = document.getElementById('saved-areas-window-inner');
var savedAreasWindow = document.getElementById('saved-areas-window');
var ua = navigator.userAgent;

savedAreasWindowInner.onclick = function (e) {
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
  if (e.srcElement.nodeName === 'I') {
    var img = e.srcElement.previousSibling;
    var targetId = Number(img.id.split('-')[2]);
    areas.splice(targetId, 1);
    areaUrls.splice(targetId, 1);
    areaBounds.splice(targetId, 1);
    screenBounds.splice(targetId, 1);
    addresses.splice(targetId, 1);

    renderSavedAreaToWindow(areas);
  }
}

if (ua.indexOf('iPhone') > 0 || ua.indexOf('iPod') > 0 || ua.indexOf('Android') > 0 && ua.indexOf('Mobile') > 0 || ua.indexOf('iPad') > 0 || ua.indexOf('Android') > 0) {
  $('.delete-thumbnail-icon').css('display', 'inline');
}

map.on('load', function () {
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
  areaUrls = JSON.parse(localStorage.getItem('mable-preview-areas')).areaUrls || [];
  areaBounds = JSON.parse(localStorage.getItem('mable-preview-areas')).areaBounds || [];
  screenBounds = JSON.parse(localStorage.getItem('mable-preview-areas')).screenBounds || [];
  addresses = JSON.parse(localStorage.getItem('mable-preview-areas')).addresses || [];
  areaUrls.forEach(function (url, i) {
    areas.push(createThumbnail(url));
  });

  renderSavedAreaToWindow(areas);
}

function addSavedAreaToWindow(url, bounds) {
  var elem = createThumbnail(url);
  areas.push(elem);
  areaUrls.push(url);
  areaBounds.push([bounds._sw.lng, bounds._sw.lat, bounds._ne.lng, bounds._ne.lat]);
  screenBounds.push([currentExportScreenBounds._sw.lng, currentExportScreenBounds._sw.lat, currentExportScreenBounds._ne.lng, currentExportScreenBounds._ne.lat]);
  if (areas.length > 6) {
    areas.shift();
    areaUrls.shift();
    areaBounds.shift();
    screenBounds.shift();
  }

  //renderSavedAreaToWindow(areas);
  var center = map.getCenter();
  reverseGeocoding(center.lng, center.lat, elem);
}

function renderSavedAreaToWindow(domArray) {
  savedAreasWindowInner.textContent = null;
  domArray.forEach(function (thumbnail, i) {
    thumbnail.childNodes.forEach(function (node) {
      if (node.nodeName === 'IMG') {
        node.id = 'saved-area-' + i;
        console.log($('#' + node.id));
        $('#' + node.id).tooltip({ title: addresses[i], container: 'body' });
      }
    });
    savedAreasWindowInner.appendChild(thumbnail);
  });
  domArray.forEach(function (thumbnail, i) {
    $('#' + 'saved-area-' + i).tooltip({ title: addresses[i], container: 'body' });
  });  

  localStorage.setItem('mable-preview-areas', JSON.stringify({ 'areaUrls': areaUrls, 'areaBounds': areaBounds, 'screenBounds': screenBounds, 'addresses': addresses }));
}

function reverseGeocoding(lng, lat, elem) {
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
        console.log('interactive... '+xhr.responseText.length+' bytes.');
        break;
      case 4:
        if( xhr.status == 200 || xhr.status == 304 ) {
          var data = JSON.parse(xhr.responseText);
          console.log('COMPLETE!');
          //addresses.push(data.features[0].text);
          addresses.push(data.features[0].place_name);
          if (areas.length > 6) {
            addresses.shift();
          }
          renderSavedAreaToWindow(areas);
        } else {
          console.log('Failed. HttpStatus: ' + xhr.statusText);
        }
        break;
    }
  };
  xhr.open('GET', requestUrl, false);
  xhr.send();
}

getAreasInLocalStorage();