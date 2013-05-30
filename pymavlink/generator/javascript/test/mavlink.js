var mavlink = require('../implementations/mavlink_ardupilotmega_v1.0/mavlink.js'),
should = require('should'),
sinon = require('sinon'),
fs = require('fs');

// Actual data stream taken from APM.
global.fixtures = global.fixtures || {};
global.fixtures.serialStream = fs.readFileSync("javascript/test/capture.mavlink");

describe("Generated MAVLink protocol handler object", function() {

  beforeEach(function() {
    this.m = new mavlink();
  });

  describe("stream decoder", function() {

    // This test prepopulates a single message as a binary buffer.
    it("decodes a binary stream representation of a single message correctly", function() {
      var b = new Buffer([0xfe, 0x09, 0x03, 0xff , 0x00 , 0x00 , 0x00 , 0x00 , 0x00 , 0x00 , 0x06 , 0x08 , 0x00 , 0x00 , 0x03, 0x9f, 0x5c])
      this.m.pushBuffer(b);
      var messages = this.m.parseBuffer();
    });

    // This test includes a "noisy" signal, with non-mavlink data/messages/noise.
    it("decodes a real serial binary stream into an array of MAVLink messages", function() {
      this.m.pushBuffer(global.fixtures.serialStream);
      var messages = this.m.parseBuffer();
    });

  });

  describe("buffer decoder", function() {

    xit('handles an empty or undefined buffer gracefully', function() { 
      should.fail('need to implement')
    });

    xit("decodes at most one message, even if there are more in its buffer", function() {

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
      var b = new Buffer([254, 1, 1]); // packet length = 1
      this.m.pushBuffer(b);
      this.m.parseLength();
      this.m.expected_length.should.equal(9); // 1+8 bytes for the message header
    });
  });

  describe("payload decoder", function() {

    beforeEach(function() {

      // Valid heartbeat payload
      this.heartbeatPayload = new Buffer([0xfe, 0x09, 0x03, 0xff , 0x00 , 0x00 , 0x00 , 0x00 , 0x00 , 0x00 , 0x06 , 0x08 , 0x00 , 0x00 , 0x03, 0x9f, 0x5c]);

    });

    it("resets the expected length of the next packet to 6 (header)", function() {
      this.m.pushBuffer(this.heartbeatPayload);
      this.m.parseLength(); // expected length should now be 9 (message) + 8 bytes (header) = 17
      this.m.expected_length.should.equal(17);
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

    it("strips unicode-type encoding values from string values", function() {
      var param_set = new mavlink.messages.param_set(1, 2, 'MAG_ENABLE', 1, 0); // extra zero = don't care about type
      var buf = new Buffer(param_set.pack(0,0,0));
      var decoded = this.m.decode(buf);
      decoded.param_id.should.equal('MAG_ENABLE');      
    });

    // Skipping because I'm not sure what I want to do with making bad_data messages,
    // or exceptions, or some combo thereof.  Need to think it through a bit more.
    it("returns a bad_data message if a borked message is encountered", function() {

      var b = new Buffer([3, 0, 1, 2, 3, 4, 5]); // invalid message -- bad prefix
      this.m.pushBuffer(b);
      var message;
      try {
        message = this.m.parsePayload();
      } catch(e) {}
      message.should.be.an.instanceof(mavlink.messages.bad_data);      

    });

    it("increments the total_receive_errors counter when an invalid prefix is encountered", function() {
         this.m.total_receive_errors.should.equal(0);
         var b = new Buffer([3, 0, 1, 2, 3, 4, 5]); // invalid message -- bad prefix
         this.m.pushBuffer(b);
         var message = this.m.parsePayload();
         this.m.total_receive_errors.should.equal(1);
    });

    it("increments the total_receive_errors counter when an invalid or unparseable payload is encountered", function() {
         this.m.total_receive_errors.should.equal(0);
         // valid prefix but with some random damage in the packet header/payload
         var b = new Buffer([0xfe, 0x19, 0x03, 0xff , 0x40 , 0x00 , 0x00 , 0x0a , 0x00 , 0x00 , 0xc6 , 0x08 , 0xff , 0x00 , 0x03, 0x9f, 0x5c]);
         this.m.pushBuffer(b);
         var message = this.m.parsePayload();
         this.m.total_receive_errors.should.equal(1);

    } );

    it("returns a valid mavlink packet if everything is OK", function() {
      this.m.pushBuffer(this.heartbeatPayload);
      this.m.parseLength();
      var message = this.m.parsePayload();
      message.should.be.an.instanceof(mavlink.messages.heartbeat);
    });

    it("emits a 'message' event, provisioning callbacks with the message, upon a valid decode", function(done) {
      this.m.pushBuffer(this.heartbeatPayload);
      this.m.parseLength();
      this.m.on('message', function(message) {
        message.should.be.an.instanceof(mavlink.messages.heartbeat);
        done();
      });
      this.m.parsePayload();
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

// todo: this test isn't exercising the MAVLink() object; should be moved elsewhere (tho the tests are valid)
describe("MAVLink  X25CRC Decoder", function() {

  beforeEach(function() {
    // Message header + payload, lacks initial MAVLink flag (FE) and CRC.
    this.heartbeatMessage = new Buffer([0x09, 0x03, 0xff , 0x00 , 0x00 , 0x00 , 0x00 , 0x00 , 0x00 , 0x06 , 0x08 , 0x00 , 0x00 , 0x03]);

  });

  // This test matches the output directly taken by inspecting what the Python implementation
  // generated for the above packet.
  it('implements x25crc function', function() {
    mavlink.x25Crc(this.heartbeatMessage).should.equal(27276);
  });

  // Heartbeat crc_extra value is 50.
  it('can accumulate further bytes as needed (crc_extra)', function() {
    var crc = mavlink.x25Crc(this.heartbeatMessage);
    crc = mavlink.x25Crc([50], crc);
    crc.should.eql(23711)
  });

});

// This test suite covers the knowledge of "connection information," the pieces
// that the generated MAVLink code needs to be able to send / receive messages.
// todo: the stub 'connection' object needs work, below
describe("MAVLink system/state maintenance", function() {

  beforeEach(function() {
    
    // dead simple stub of connection object
    var fakeConnection = function() {};
    fakeConnection.prototype.name = 'connection';
    fakeConnection.prototype.write =  function(message) {};
    this.c = new fakeConnection();
    this.m = new mavlink();
    this.m.setConnection(this.c); 

  });

  it('accepts a connection object via a setConnection method', function() {
    this.m.setConnection(this.c); // redundant to the beforeEach method, just putting it here for clarity of the test.
    this.m.connection.name.should.equal('connection');
  });

  it('can send a MAVLink message', function() {
    var h = new mavlink.messages.heartbeat();
    this.m.send(h);
  });

  it('knows the source system it is associated with, defaulting to 1', function() {
    this.m.srcSystem.should.equal(1);
  });

  it('knows the source component it is associated with, defaulting to 1', function() {
    this.m.srcComponent.should.equal(1);
  });

  it('uses the correct source and component numbers when building the header for a message', function() {
    var h = new mavlink.messages.heartbeat();
    this.m.send(h);
    h.header.srcSystem.should.equal(1);
    h.header.srcComponent.should.equal(1);
  });

  it('uses the correct seq number when building the header for a message', function() {
    // Fake the seq #
    this.m.seq = 2;
    var h = new mavlink.messages.heartbeat();
    this.m.send(h);
    h.header.seq.should.equal(2);
  });

  describe('sequence number', function() {

    it('starts at 0', function() {
      this.m.seq.should.equal(0);
    });

    it('increments once when a MAVLink message is sent', function() {
      var h = new mavlink.messages.heartbeat();
      this.m.send(h);
      this.m.seq.should.equal(1);
    });

    it('is modulo 0xFF', function() {
      this.m.seq = 254;
      var h = new mavlink.messages.heartbeat();
      this.m.send(h);
      this.m.seq.should.equal(0);

    });

  });

});