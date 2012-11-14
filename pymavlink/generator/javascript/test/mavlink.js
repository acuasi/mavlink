var mavlink = require('../implementations/mavlink_ardupilotmega_v1.0.js'),
  should = require('should');

describe("Generated MAVLink protocol handler object", function() {

  it("should exist and parse without errors", function() {
    mavlink.should.exist;
  });

  it("can be instantiated", function() {
    var m = new MAVLink();
  });

});