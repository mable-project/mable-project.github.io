'use strict';

var areas = [];
var areaBounds = [];
var areaUrls = [];
var savedAreasWindow = document.getElementById('saved-areas-window-inner');

savedAreasWindow.onclick = function (e) {
  getStreetsPNGInBounds(areaBounds[Number(e.srcElement.id.split()[2])]);
}

function getAreasInLocalStorage() {
  areaUrls = JSON.parse(localStorage.getItem('mable-preview-areas')).areaUrls;
  areaBounds = JSON.parse(localStorage.getItem('mable-preview-areas')).areaBounds;
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
  areaBounds.push(bounds);
  if (areas.length > 6) {
    areas.shift();
    areaUrls.shift();
  }

  renderSavedAreaToWindow(areas);
}

function renderSavedAreaToWindow(domArray) {
  savedAreasWindow.textContent = null;
  domArray.forEach(function (a, i) {
    a.id = 'saved-area-' + i;
    savedAreasWindow.appendChild(a);
  });

  localStorage.setItem('mable-preview-areas', JSON.stringify({ 'areaUrls': areaUrls, 'areaBounds': areaBounds }));
}

getAreasInLocalStorage();