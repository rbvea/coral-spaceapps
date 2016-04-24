/**
 * GIBS Web Examples
 *
 * Copyright 2013 - 2014 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

$(function() {

    var EPSG4326 = new L.Proj.CRS(
        "EPSG:4326",
        "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs", {
            origin: [-180, 90],
            resolutions: [
                0.5625,
                0.28125,
                0.140625,
                0.0703125,
                0.03515625,
                0.017578125,
                0.0087890625,
                0.00439453125,
                0.002197265625
            ],
            // Values are x and y here instead of lat and long elsewhere.
            bounds: [
               [-180, -90],
               [180, 90]
            ]
        }
    );

    // Seven day slider based off today, remember what today is
        // var today = new Date();
    // Overriding today with yesterday, since data cannot exist for today
    var today = new Date(new Date() - 864e5);

    // Selected day to show on the map
    var day = new Date(today.getTime());

    // When the day is changed, cache previous layers. This allows already
    // loaded tiles to be used when revisiting a day. Since this is a
    // simple example, layers never "expire" from the cache.
    var cache = {};

    // GIBS needs the day as a string parameter in the form of YYYY-MM-DD.
    // Date.toISOString returns YYYY-MM-DDTHH:MM:SSZ. Split at the "T" and
    // take the date which is the first part.

    var dayParameter = function() {
        return day.toISOString().split("T")[0];

    };

    var map = L.map("map", {
        center: [0, 0],
        zoom: 2,
        maxZoom: 8,
        crs: EPSG4326,

        maxBounds: [
            [-120, -300],
            [120, 300]
        ],

        // Animation interferes with smooth scrolling of the slider once
        // all the layers are cached
        fadeAnimation: false
    });

    var mapIcon = L.divIcon({className: 'leaflet-div-icon'});
    map.on('click', function(e){
        var marker = new L.marker(e.latlng, {icon: mapIcon}).addTo(map);
    });

    var update = function() {
        // Using the day as the cache key, see if the layer is already
        // in the cache.
        var key = dayParameter();
        var layer = cache[key];

        // If not, create a new layer and add it to the cache.
        if ( !layer ) {
            layer = createLayer();
            cache[key] = layer;
        }

        // There is only one layer in this example, but remove them all
        // anyway
        clearLayers();

        // Add the new layer for the selected time
        map.addLayer(layer);

        // Update the day label
        $("#day-label").html(dayParameter());
    };

    var clearLayers = function() {
        map.eachLayer(function(layer) {
            map.removeLayer(layer);
        });
    };

    var template =
        "http://map1{s}.vis.earthdata.nasa.gov/wmts-geo/" +
        "{layer}/default/{time}/{tileMatrixSet}/{z}/{y}/{x}.png";

    var createLayer = function() {
        var layer = L.tileLayer(template, {
            layer: "GHRSST_L4_MUR_Sea_Surface_Temperature",
            tileMatrixSet: "EPSG4326_1km",
            time: dayParameter(),
            tileSize: 512,
            subdomains: "abc",
            noWrap: false, // <-- hmm, make map wrap around? (hard to center on hawaii at edge)
            continuousWorld: true,
            // Prevent Leaflet from retrieving non-existent tiles on the
            // borders.
            bounds: [
                [-89.9999, -179.9999],
                [89.9999, 179.9999]
            ],
            attribution:
                "<a href='https://wiki.earthdata.nasa.gov/display/GIBS'>" +
                "NASA EOSDIS GIBS</a>&nbsp;&nbsp;&nbsp;" +
                "<a href='https://github.com/nasa-gibs/web-examples/blob/release/examples/leaflet/time.js'>" +
                "View Source" +
                "</a>"
        });
        return layer;
    };

    update();

});
