module.exports = {
  translateJSON: (json) => {
    // a deep copy of `json``
    let obj = JSON.parse(JSON.stringify(json));

    switch (obj.type) {
      case 'ShipmentRegistration':
        for (const k in obj.payload) {
          if (k === 'id') {
            obj.payload[k] = convertBytesToStr(obj.payload[k]);
          } else if (k === 'products') {
            obj.payload[k] = obj.payload[k].map(el => convertBytesToStr(el)).join(', ');
          }
        }
        break;
      case 'ShipmentPickup':
      case 'ShipmentDelivery':
        for (const k in obj.payload) {
          if (k === 'event_id' || k === 'shipment_id') {
            obj.payload[k] = convertBytesToStr(obj.payload[k]);
          }
          if (k === 'readings') {
            const readings = obj.payload[k];
            obj.payload[k] = readings.map(reading => ({
              device_id: convertBytesToStr(reading.device_id),
              reading_type: reading.reading_type,
              timestamp: reading.timestamp,
              value: reading.value,
            }));
          }
        }
        break;
    }

    return obj;
  }
};

// bytes is an array of byte
const convertBytesToStr = bytes =>
  bytes.map(byte => String.fromCharCode(byte)).join('')
