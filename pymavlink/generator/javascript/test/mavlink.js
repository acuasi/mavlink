var mavlink = require('../implementations/mavlink_ardupilotmega_v1.0.js'),
  should = require('should');

describe("Generated MAVLink protocol handler object", function() {

  beforeEach(function() {
    this.m = new MAVLink();
  });

  it("has a stream decoder that can decode a stream into an array of MAVLink messages", function() {
  
  });

  describe("buffer decoder", function() {

    it("decodes at most one message, even if there are more in its buffer", function() {

    });
    
    it("returns null while no packet is available", function() {
      (this.m.parseBuffer() === null).should.equal(true); // should's a bit tortured here
    });

  });

  describe("buffer accumulator", function() {

    it("increments total bytes received", function() {
      this.m.total_bytes_received.should.equal(0);
      var b = new Buffer(16);
      b.fill("h");
      this.m.pushBuffer(b);
      this.m.total_bytes_received.should.equal(16);
    });

    it("appends data to its local buffer", function() {
      this.m.buf.length.should.equal(0);
      var b = new Buffer(16);
      b.fill("h");
      this.m.pushBuffer(b);
      this.m.buf.should.eql(b); // eql = wiggly equality
    });
  });

  describe("prefix decoder", function() {

    it("sets the have_prefix_error to false if the prefix is OK", function() {
      this.m.have_prefix_error = true;
      var b = new Buffer(16);
      b[0] = 254; // MAVLink magic prefix
      this.m.pushBuffer(b);
      this.m.parsePrefix();
      this.m.have_prefix_error.should.equal(false);
    });

    it("sets have_prefix_error to true if a prefix error exists", function() {
      var b = new Buffer(1);
      b[0] = 1;
      this.m.pushBuffer(b);
      (function() { this.m.parsePrefix(); } ); // funny syntax = eat exceptions.  that function throws.
            
      this.m.have_prefix_error.should.equal(true);

    });

    it("consumes, unretrievably, the first byte of the buffer, if its a bad prefix", function() {
      var b = new Buffer(2);
      b[0] = 1;
      b[1] = 254;
      this.m.pushBuffer(b);
      (function() { this.m.parsePrefix(); } ); // funny syntax = eat exceptions.  that function throws.
      this.m.buf.length.should.equal(1);
      this.m.buf[0].should.equal(254);
    });

    it("throws an error?? if it gets a bad packet?? why?? TODO check if this is right.", function() {
      var b = new Buffer(1);
      b[0] = 1;
      this.m.pushBuffer(b);
      (function() { this.m.parsePrefix(); }).should.throw();
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