var L = require('leaflet');
require('@technocom/leaflet-draw');
require('@technocom/leaflet-path-drag');

require('./src/EditToolbar.Edit');
require('./src/Edit.SimpleShape.Drag');
require('./src/Edit.Circle.Drag');
require('./src/Edit.Poly.Drag');
require('./src/Edit.Rectangle.Drag');

module.exports = L.Edit.Poly;
