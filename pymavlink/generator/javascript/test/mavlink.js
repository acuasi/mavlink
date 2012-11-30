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

  describe("stream buffer accumulator", function() {

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
 
    it("consumes, unretrievably, the first byte of the buffer, if its a bad prefix", function() {

      var b = new Buffer([1, 254]);
      this.m.pushBuffer(b);
      
      // eat the exception here.
      try {
        this.m.parsePrefix();
      } catch (e) {
        this.m.buf.length.should.equal(1);
        this.m.buf[0].should.equal(254);
      }
    
    });

    it("throws an exception if a malformed prefix is encountered", function() {

      var b = new Buffer([15, 254, 1, 7, 7]); // borked system status packet, invalid
      this.m.pushBuffer(b);
      var m = this.m;
      (function() { m.parsePrefix(); }).should.throw('Bad prefix (15)');

    });

  });

  describe("length decoder", function() {
    it("updates the expected length to the size of the expected full message", function() {
      this.m.expected_length.should.equal(6); // default, header size
      var b = new Buffer([254, 1, 4]); // packet length = 1
      this.m.pushBuffer(b);
      this.m.parseLength();
      this.m.expected_length.should.equal(9); // 1+8 bytes for the message ID
    });
  });

  describe("payload decoder", function() {
   
    beforeEach(function() {

      // Valid heartbeat payload
      this.heartbeatPayload = new Buffer([ 254, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 128, 3, 0 ]);
    
    });

    it("resets the expected length of the next packet to 6 (header)", function() {
      this.m.pushBuffer(this.heartbeatPayload);
      this.m.parseLength(); // expected length should now be 9 + 8bytes = 17
      this.m.expected_length.should.equal(17);
      this.m.parsePayload();
      this.m.expected_length.should.equal(6);
    });

    it("slices off the length of the message", function() {
      this.m.pushBuffer(this.heartbeatPayload);
      this.m.parseLength();      
      this.m.parsePayload();
      this.m.buf.length.should.equal(15); // no idea what this should be yet!
    });

    it("throw an exception if a borked message is encountered", function() {
      var b = new Buffer([3, 0, 1, 2, 3, 4, 5]); // invalid message
      (function() { this.m.parsePayload(); }).should.throw('Malformed message encountered: [3, 0, 1, 2, 3, 4, 5]');
    });

    it("returns a valid mavlink packet if everything is OK", function() {
      this.m.pushBuffer(this.heartbeatPayload);
      (this.m.parsePayload()).should.be.an.instanceof(mavlink.messages.heartbeat);
    });

    it("increments the total packets received if a good packet is decoded", function() {
      this.m.total_packets_received.should.equal(0);
      this.m.pushBuffer(this.heartbeatPayload);
      (this.m.parsePayload()).should.be.an.instanceof(mavlink.messages.heartbeat);
      this.m.total_packets_received.should.equal(1);
    });
  });

});