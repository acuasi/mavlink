var mavlink = require('../implementations/mavlink_ardupilotmega_v1.0.js'),
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

describe('MAVLink header', function() {

  beforeEach(function() {
    this.h = new mavlink.header(mavlink.MAVLINK_MSG_ID_BATTERY_STATUS, 1, 2, 3, 4);
  })

  it('Can pack itself', function() {
    this.h.pack().should.eql([254, 1, 2, 3,4, 147]);
  });

});

describe('MAVLinkMessage', function() {

  beforeEach(function() {

    this.heartbeat = new mavlink.messages.heartbeat(
      mavlink.MAV_TYPE_GENERIC,
      mavlink.MAV_AUTOPILOT_ARDUPILOTMEGA,
      mavlink.MAV_MODE_FLAG_SAFETY_ARMED,
      0, // custom bitfield
      mavlink.MAV_STATE_STANDBY
      // The sixth field is apparently implicit, for the heartbeat (mavlink version)
    );

  });

  it('has a set function to facilitate vivifying the object', function() {
    this.heartbeat.type.should.equal(mavlink.MAV_TYPE_GENERIC);
    this.heartbeat.autopilot.should.equal(mavlink.MAV_AUTOPILOT_ARDUPILOTMEGA);
    this.heartbeat.base_mode.should.equal(mavlink.MAV_MODE_FLAG_SAFETY_ARMED);
    this.heartbeat.custom_mode.should.equal(0);
    this.heartbeat.system_status.should.equal(mavlink.MAV_STATE_STANDBY);
  });

  // TODO: the length below (9) should perhaps be instead 7.  See mavlink.unpack().
  // might have to do with the length of the encoding (<I is 4 symbols in the array) 
  it('Can pack itself', function() {
    
    var packed = this.heartbeat.pack();
    packed.should.eql([254, 9, 0, 0, 0, mavlink.MAVLINK_MSG_ID_HEARTBEAT, // that bit is the header,
      // this is the payload, arranged in the order map specified in the protocol,
      // which differs from the constructor.
      0, 0, 0, 0, // custom bitfield -- length 4 (type=I)
      mavlink.MAV_TYPE_GENERIC,
      mavlink.MAV_AUTOPILOT_ARDUPILOTMEGA,
      mavlink.MAV_MODE_FLAG_SAFETY_ARMED,
      mavlink.MAV_STATE_STANDBY,
      0 // not sure, this is supposed to be auto-added?
      ]);

  });

  it('Can decode itself', function() {

    var packed = this.heartbeat.pack();
    var m = new mavlink();
    var message = m.decode(packed);
    message.should.equal(this.heartbeat);

  });


});