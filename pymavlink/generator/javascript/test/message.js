var mavlink = require('../implementations/mavlink_ardupilotmega_v1.0.js'),
  should = require('should');

console.log(mavlink);

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

    this.heartbeat = new mavlink.messages.heartbeat(
      mavlink.MAV_TYPE_GENERIC,
      mavlink.MAV_AUTOPILOT_ARDUPILOTMEGA,
      mavlink.MAV_MODE_FLAG_SAFETY_ARMED,
      0, // custom bitfield
      mavlink.MAV_STATE_STANDBY
    );

  });

  it('Can pack itself', function() {
    var packed = this.heartbeat.pack();
    packed.should.equal('abcdefg');
  });

  it('Can decode itself', function() {
    this.m.should.have.property.decode;
  });


});