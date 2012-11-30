var mavlink = require('../implementations/mavlink_ardupilotmega_v1.0.js'),
  should = require('should');

describe("Generated MAVLink protocol handler object", function() {

  it("should exist and parse without errors", function() {
    mavlink.should.exist;
  });

  it("can be instantiated", function() {
    var m = new MAVLink();
  });

  it("has a stream decoder that can decode a stream into an array of MAVLink messages", function() {
  });

  describe("buffer decoder", function() {
    it("decodes at most one message, even if there are more in its buffer", function() {

    });
    it("returns null while no packet is available", function() {

    });
  });

  describe("buffer accumulator", function() {
    it("increments total bytes received", function() {

    });

    it("appends data to its local buffer", function() {

    });
  });

  describe("prefix decoder", function() {
    it("sets the have_prefix_error to false if the prefix is OK", function() {

    });
    it("slices off the first byte of the buffer", function() {

    });
    it("throws an error?? if it gets a bad packet?? why??", function() {

    });
    it("returns a mavlink_bad_data packet if robust_parsing is true and a borked packet is encountered", function() {

    });
  });
  describe("length decoder", function() {
    it("updates the expected length to whatever the packet specifies if theres enough data in the buffer to determine that", function() {

    });
  });

  describe("packet decoder", function() {
    it("resets the expected length of the next packet to 6 (header)", function() {

    });

    it("slices off the length of the message", function() {

    });

    it("returns a bad_mavlink_data packet if robust parsing is true and a borked packet is encountered", function() {

    });

    it("returns a valid mavlink packet if everything is OK", function() {

    });

    it("increments the total packets received if a good packet is decoded", function() {

    });
  });

});