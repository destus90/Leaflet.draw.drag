/**
 * Dragging routines for poly handler
 */

L.Edit.Rectangle.include( /** @lends L.Edit.Rectangle.prototype */ {

  /**
   * @override
   */
  addHooks: function() {
    if (this._shape._map) {
      this._map = this._shape._map;
      this._shape.setStyle(this._shape.options.editing);
      if (!this._markerGroup) {
        this._enableDragging();
        this._initMarkers();
      }
      this._shape._map.addLayer(this._markerGroup);
    }
  },

  /**
   * @override
   */
  removeHooks: function() {
    this._shape.setStyle(this._shape.options.original);
    if (this._shape._map) {
      this._shape._map.removeLayer(this._markerGroup);
      this._disableDragging();
      delete this._markerGroup;
      delete this._markers;
    }
    this._map = null;
  },

  /**
   * @override
   */
  _resize: function(latlng) {
    // Update the shape based on the current position of
    // this corner and the opposite point
    this._shape.setBounds(L.latLngBounds(latlng, this._oppositeCorner));
    this._updateMoveMarker();

    this._shape._map.fire('draw:editresize', { layer: this._shape });
  },

  /**
   * @override
   */
  _onMarkerDragEnd: function(e) {
    this._toggleCornerMarkers(1);
    this._repositionCornerMarkers();

    L.Edit.SimpleShape.prototype._onMarkerDragEnd.call(this, e);
  },

  /**
   * Adds drag start listeners
   */
  _enableDragging: function() {
    if (!this._shape.dragging) {
      this._shape.dragging = new L.Handler.PathDrag(this._shape);
    }
    this._shape.dragging.enable();
    this._shape
      .on('dragstart', this._onStartDragFeature, this)
      .on('dragend', this._onStopDragFeature, this);
  },

  /**
   * Removes drag start listeners
   */
  _disableDragging: function() {
    this._shape.dragging.disable();
    this._shape
      .off('dragstart', this._onStartDragFeature, this)
      .off('dragend', this._onStopDragFeature, this);
  },

  /**
   * Start drag
   * @param  {L.MouseEvent} evt
   */
  _onStartDragFeature: function() {
    this._shape._map.removeLayer(this._markerGroup);
    this._shape.fire('editstart');
  },

  /**
   * Dragging stopped, apply
   * @param  {L.MouseEvent} evt
   */
  _onStopDragFeature: function() {
    var polygon = this._shape;
    for (var j = 0, jj = polygon._latlngs.length; j < jj; j++) {
      for (var i = 0, len = polygon._latlngs[j].length; i < len; i++) {
        // update marker
        var marker = this._resizeMarkers[i];
        marker.setLatLng(polygon._latlngs[j][i]);

        // this one's needed to update the path
        marker._origLatLng = polygon._latlngs[j][i];
        if (marker._middleLeft) {
          marker._middleLeft.setLatLng(this._getMiddleLatLng(marker._prev, marker));
        }
        if (marker._middleRight) {
          marker._middleRight.setLatLng(this._getMiddleLatLng(marker, marker._next));
        }
      }
    }
    // this._moveMarker.setLatLng(polygon.getBounds().getCenter());

    // show vertices
    this._shape._map.addLayer(this._markerGroup);
    this._updateMoveMarker();

    var corners = this._getCorners();
    for (var i = 0, l = this._resizeMarkers.length; i < l; i++) {
      // don't call setLatLng so that we don't fire an unnecessary 'move' event
      this._resizeMarkers[i]._latlng = corners[i];
      this._resizeMarkers[i].update();
    }
	this._shape._map.fire(L.Draw.Event.EDITMOVE, { layer: this._shape });
    this._fireEdit();
  }
});
