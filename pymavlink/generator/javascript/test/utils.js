var mavutil = require('../lib/mavutil.js');

describe("MAVUtil library", function() {
  
  beforeEach(function() {
    this.heartbeatMessage = new Buffer([ 254, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 128, 3, 0 ]);
  });

  it('implements x25crc', function() {
    // fake no-op test
    mavutil.x25Crc(new Buffer([0, 2, 4, 6, 8, 32, 64, 128, 254])).should.equal(0x73c3);
  });

});