var mavlink = require('../implementations/mavlink_ardupilotmega_v1.0.js').mavlink,
  should = require('should');

describe('MAVLink message registry', function() {

  it('defines constructors for every message', function() {
    mavlink.messages['battery_status'].should.be.a.function;
  });

  it('assigns message properties to each message', function() {
    var m = new mavlink.messages['battery_status']();
    m.format.should.equal("<HHHHHHhBb");
    m.order_map.should.eql([7, 0, 1, 2, 3, 4, 5, 6, 8]); // should.eql = shallow comparison
    m.crc_extra.should.equal(42);
    m.id.should.equal(mavlink.MAVLINK_MSG_ID_BATTERY_STATUS);
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