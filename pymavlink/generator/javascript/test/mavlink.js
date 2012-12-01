var mavlink = require('../implementations/mavlink_ardupilotmega_v1.0.js'),
  should = require('should'),
  sinon = require('sinon'),
  fs = require('fs');

// Actual data stream taken from APM.
global.fixtures = global.fixtures || {};
global.fixtures.serialStream = fs.readFileSync("javascript/test/serial-data-fixture");

describe("Generated MAVLink protocol handler object", function() {

  beforeEach(function() {
    this.m = new MAVLink();  
  });

  it("has a stream decoder that can decode a stream into an array of MAVLink messages", function() {
    this.m.pushBuffer(global.fixtures.serialStream);
    var messages = this.m.parseBuffer();
    console.log(messages);
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
      var b = new Buffer([254, 1]); // packet length = 1
      this.m.pushBuffer(b);
      this.m.parseLength();
      this.m.expected_length.should.equal(7); // 1+6 bytes for the message header
    });
  });

  describe("payload decoder", function() {
   
    beforeEach(function() {

      // Valid heartbeat payload
      this.heartbeatPayload = new Buffer([ 254, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 128, 3, 0 ]);
    
    });

    it("resets the expected length of the next packet to 6 (header)", function() {
      this.m.pushBuffer(this.heartbeatPayload);
      this.m.parseLength(); // expected length should now be 9 (message) + 6 bytes (header) = 17
      this.m.expected_length.should.equal(15);
      this.m.parsePayload();
      this.m.expected_length.should.equal(6);
    });

    it("submits a candidate message to the mavlink decode function", function() {
      
      var spy = sinon.spy(this.m, 'decode');
    
      this.m.pushBuffer(this.heartbeatPayload);
      this.m.parseLength();
      this.m.parsePayload();

      // could improve this to check the args more closely.
      // It'd be better but tricky because the type comparison doesn't quite work.
      spy.called.should.be.true;
    });

    it("returns a bad_data message if a borked message is encountered", function() {
      var b = new Buffer([3, 0, 1, 2, 3, 4, 5]); // invalid message
      this.m.pushBuffer(b);
      var message = this.m.parsePayload();
      message.should.be.an.instanceof(mavlink.messages.bad_data);      
    });

    it("returns a valid mavlink packet if everything is OK", function() {
      this.m.pushBuffer(this.heartbeatPayload);
      this.m.parseLength();
      var message = this.m.parsePayload();
      message.should.be.an.instanceof(mavlink.messages.heartbeat);
    });

    it("increments the total packets received if a good packet is decoded", function() {
      this.m.total_packets_received.should.equal(0);
      this.m.pushBuffer(this.heartbeatPayload);
      this.m.parseLength();
      var message = this.m.parsePayload();
      this.m.total_packets_received.should.equal(1);
    });
  });

});