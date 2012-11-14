var mavlink = require('../implementations/mavlink_ardupilotmega_v1.0.js').mavlink,
  should = require('should');

describe('MAVLink message registry', function() {

  it('defines constructors for every message', function() {
    mavlink.messages['battery_status'].should.be.a.function;
  });

  it('assigns message properties to each message', function() {
    mavlink.messages['battery_status'].format.should.equal("<HHHHHHhBb");
    mavlink.messages['battery_status'].order_map.should.equal([7, 0, 1, 2, 3, 4, 5, 6, 8]);
    mavlink.messages['battery_status'].crc_extra.should.equal(134);
    mavlink.messages['battery_status'].id.should.equal(mavlink.mavlink.MAVLINK_MSG_ID_BATTERY_STATUS);
  });

});

describe('MAVLinkMessage', function() {

  beforeEach(function() {
    this.m = new mavlink.messages['battery_status'];
  });

  it('Can encode itself', function() {
    this.m.should.have.property.encode;
  });

  it('Can decode itself', function() {
    this.m.should.have.property.decode;
  });


});