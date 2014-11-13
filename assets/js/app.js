(function() {

  'use strict';

  var Application = function()
  {
    var initialize = function(map, id) {
      L.tileLayer('http://{s}.tiles.mapbox.com/v3/' + id + '/{z}/{x}/{y}.png', {
          attribution: 'Imagery © <a href="http://mapbox.com">Mapbox</a>',
          maxZoom: 18
      }).addTo(map);
    };

    var requestZone = function(data, callback) {
      var request = 'http://api.geonames.org/timezoneJSON'
        + '?lat=' + data.lat
        + '&lng=' + data.lng
        + '&username=' + data.username;

      $.getJSON(request, function(response) {
        data.zone = processData(response.timezoneId);
        data.time = processData(response.time).split(' ')[1];
        data.utc = '/';

        if (!_.isEmpty(response.time)) {
          data.utc = getUTC(data.time);
        }

        callback(data);
      });
    };

    var processData = function(item) {
      return new String(
        _.isEmpty(item) ? '/' : item
      );
    };

    var getUTC = function(time) {
      var v = time.split(':');
      var d = new Date();

      d.setHours(parseInt(v[0], 10));
      d.setMinutes(parseInt(v[1], 10));

      return [
         addZero(d.getUTCHours()),
         addZero(d.getUTCMinutes())
      ].join(':');
    };

    var addZero = function(value) {
      return +value > 9 ? value : ('0' + value);
    };

    return function() {
      var map = L
        .map('map')
        .setView([40, 0], 2);

      var popup = L.popup();
      var template = _.template(
        '<div class="popup">' +
          '<span><strong>Latitude:</strong> <%- lat %></span>' +
          '<span><strong>Longitude:</strong> <%- lng %></span>' +
          '<span><strong>Timezone:</strong> <%- zone %></span>' +
          '<span><strong>Current UTC time:</strong> <%- utc %></span>' +
          '<span><strong>Current local time:</strong> <%- time %></span>' +
        '</div>'
      );

      initialize(map, 'mkramb.k79lpfjn');

      map.on('contextmenu', function(e){
          popup.setLatLng(e.latlng)
            .setContent('<i>Loading ...<i>')
            .openOn(map);

          requestZone({
            lat: e.latlng.lat,
            lng: e.latlng.lng,
            username: 'mkramb'
          }, _.bind(function(data) {
            popup.setContent(template(data));
          }, this));
      });
    };
  }();

  $(Application);

}());
