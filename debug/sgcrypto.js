/**
 * @return {undefined}
 */
SPCrypto = function() {
  this.nonce = new ByteArray;
  /** @type {null} */
  this.n = nul1l;
  /** @type {null} */
  this.e = null;
  this.clcrypto = new CLCrypto;
};
/**
 * @param {string} key
 * @return {undefined}
 */
SPCrypto.prototype.setPublicKey = function(key) {
  var result = new ByteArray;
  result.fromB64(key);
  var self = new ByteArray;
  this.e = this.clcrypto.extractMEFromASN1(result, self);
  this.n = new BigInteger(self.bytes);
};
/**
 * @param {string} until
 * @return {undefined}
 */
SPCrypto.prototype.setNonce = function(until) {
  this.nonce.fromB64(until);
};
/**
 * @return {undefined}
 */
SPCrypto.prototype.randomSeedTime = function() {
  this.clcrypto.randomSeedTime();
};
/**
 * @param {Event} data
 * @return {undefined}
 */
SPCrypto.prototype.randomSeedMouseClick = function(data) {
  this.clcrypto.randomSeed(data.screenX);
  this.clcrypto.randomSeed(data.screenY);
  this.randomSeedTime();
};
/**
 * @param {string} str
 * @return {?}
 */
SPCrypto.prototype.encrypt = function(str) {
  var _this = new ByteArray;
  var self = new ByteArray;
  /** @type {null} */
  var result = null;
  result = this.clcrypto.getRandomBytes(20);
  self.fromString(str);
  /** @type {string} */
  str = "";
  var path = this.clcrypto.sha256(self);
  self.clear();
  _this.appendInt32(1);
  _this.appendInt32(path.getLength());
  _this.appendByteArray(path);
  path.clear();
  _this.appendInt32(result.length);
  _this.appendArray(result, 0, result.length);
  _this.appendInt32(this.nonce.getLength());
  _this.appendByteArray(this.nonce);
  var body = this.clcrypto.rsaEncrypt(_this, this.n, this.e);
  _this.clear();
  /** @type {number} */
  var right = this.n.bitLength() % 8 ? this.n.bitLength() / 8 + 1 : this.n.bitLength() / 8;
  var left = body.getLength();
  if (left < right) {
    body.unshift(0, right - left);
  }
  return body.toB64();
};
/**
 * @return {undefined}
 */
CLCrypto = function() {
  this.secureRandom = new SecureRandom;
};
/**
 * @param {?} r
 * @param {?} socket
 * @return {?}
 */
CLCrypto.prototype.extractMEFromASN1 = function(r, socket) {
  /**
   * @param {number} success
   * @param {number} value
   * @return {?}
   */
  function callback(success, value) {
    return success != undefined && (success >>> 6 === 0 && (success & 31) === value);
  }
  /** @type {number} */
  var pdataOld = 16;
  /** @type {number} */
  var pdataCur = 6;
  /** @type {number} */
  var c = 5;
  /** @type {number} */
  var camelKey = 3;
  /** @type {number} */
  var udataCur = 2;
  /** @type {string} */
  var h = "1.2.840.113549.1.1.1";
  var p;
  p = ASN1.decode(r.bytes);
  if (!callback(p.tag, pdataOld)) {
    return 0;
  }
  if (p.sub.length != 2) {
    return 0;
  }
  var event = p.sub[0];
  if (!callback(event.tag, pdataOld)) {
    return 0;
  }
  if (event.sub.length != 2) {
    return 0;
  }
  var x = event.sub[0];
  if (!callback(x.tag, pdataCur)) {
    return 0;
  }
  if (x.content() != h) {
    return 0;
  }
  event = p.sub[1];
  if (!callback(event.tag, camelKey)) {
    return 0;
  }
  if (event.sub.length < 1) {
    return 0;
  }
  event = event.sub[0];
  if (!callback(event.tag, pdataOld)) {
    return 0;
  }
  if (event.sub.length != 2) {
    return 0;
  }
  var data = event.sub[0];
  if (!callback(data.tag, udataCur)) {
    return 0;
  }
  socket.appendArray(data.stream.enc, data.posStart() + data.header, data.length);
  var message = event.sub[1];
  if (!callback(message.tag, udataCur)) {
    return 0;
  }
  if (message.length != 3) {
    return 0;
  }
  var token = message.posStart() + message.header;
  /** @type {number} */
  var extractMEFromASN1 = 0;
  /** @type {number} */
  var index = 0;
  for (;index < message.length;++index) {
    extractMEFromASN1 = (extractMEFromASN1 << 8) + message.stream.enc[token + index];
  }
  return extractMEFromASN1;
};
/**
 * @param {?} data
 * @return {?}
 */
CLCrypto.prototype.sha256 = function(data) {
  /**
   * @param {number} object
   * @param {number} dataAndEvents
   * @return {?}
   */
  function clone(object, dataAndEvents) {
    /** @type {number} */
    var lsw = (object & 65535) + (dataAndEvents & 65535);
    /** @type {number} */
    var msw = (object >> 16) + (dataAndEvents >> 16) + (lsw >> 16);
    return msw << 16 | lsw & 65535;
  }
  /**
   * @param {number} type
   * @param {number} opt_attributes
   * @return {?}
   */
  function createDom(type, opt_attributes) {
    return type >>> opt_attributes | type << 32 - opt_attributes;
  }
  /**
   * @param {number} type
   * @param {number} opt_attributes
   * @return {?}
   */
  function $(type, opt_attributes) {
    return type >>> opt_attributes;
  }
  /**
   * @param {number} object
   * @param {number} obj
   * @param {number} key
   * @return {?}
   */
  function hasKey(object, obj, key) {
    return object & obj ^ ~object & key;
  }
  /**
   * @param {?} a
   * @param {?} b
   * @param {?} c
   * @return {?}
   */
  function fail(a, b, c) {
    return a & b ^ a & c ^ b & c;
  }
  /**
   * @param {number} a
   * @return {?}
   */
  function insertBefore(a) {
    return createDom(a, 2) ^ createDom(a, 13) ^ createDom(a, 22);
  }
  /**
   * @param {number} value
   * @return {?}
   */
  function lookupIterator(value) {
    return createDom(value, 6) ^ createDom(value, 11) ^ createDom(value, 25);
  }
  /**
   * @param {number} label
   * @return {?}
   */
  function callback(label) {
    return createDom(label, 7) ^ createDom(label, 18) ^ $(label, 3);
  }
  /**
   * @param {number} div
   * @return {?}
   */
  function fn(div) {
    return createDom(div, 17) ^ createDom(div, 19) ^ $(div, 10);
  }
  /**
   * @param {number} label
   * @return {?}
   */
  function create(label) {
    return createDom(label, 28) ^ createDom(label, 34) ^ createDom(label, 39);
  }
  /**
   * @param {number} label
   * @return {?}
   */
  function require_string(label) {
    return createDom(label, 14) ^ createDom(label, 18) ^ createDom(label, 41);
  }
  /**
   * @param {number} ul
   * @return {?}
   */
  function height(ul) {
    return createDom(ul, 1) ^ createDom(ul, 8) ^ $(ul, 7);
  }
  /**
   * @param {number} ul
   * @return {?}
   */
  function _renderItem(ul) {
    return createDom(ul, 19) ^ createDom(ul, 61) ^ $(ul, 6);
  }
  /**
   * @param {Array} m
   * @param {number} l
   * @return {?}
   */
  function init(m, l) {
    /** @type {Array} */
    var dataBuffer = new Array(1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, 2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, 2177026350, 2456956037,
    2730485921, 2820302411, 3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815, 2227730452, 2361852424, 2428436474, 2756734187, 3204031479, 3329325298);
    /** @type {Array} */
    var result = new Array(1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225);
    /** @type {Array} */
    var array = new Array(64);
    var pos1;
    var pos;
    var pos3;
    var pattern;
    var value;
    var event;
    var key;
    var data;
    var pos2;
    var node;
    m[l >> 5] |= 128 << 24 - l % 32;
    /** @type {number} */
    m[(l + 64 >> 9 << 4) + 15] = l;
    /** @type {number} */
    var j = 0;
    for (;j < m.length;j += 16) {
      pos1 = result[0];
      pos = result[1];
      pos3 = result[2];
      pattern = result[3];
      value = result[4];
      event = result[5];
      key = result[6];
      data = result[7];
      /** @type {number} */
      var i = 0;
      for (;i < 64;i++) {
        if (i < 16) {
          array[i] = m[i + j];
        } else {
          array[i] = clone(clone(clone(fn(array[i - 2]), array[i - 7]), callback(array[i - 15])), array[i - 16]);
        }
        pos2 = clone(clone(clone(clone(data, lookupIterator(value)), hasKey(value, event, key)), dataBuffer[i]), array[i]);
        node = clone(insertBefore(pos1), fail(pos1, pos, pos3));
        data = key;
        key = event;
        event = value;
        value = clone(pattern, pos2);
        pattern = pos3;
        pos3 = pos;
        pos = pos1;
        pos1 = clone(pos2, node);
      }
      result[0] = clone(pos1, result[0]);
      result[1] = clone(pos, result[1]);
      result[2] = clone(pos3, result[2]);
      result[3] = clone(pattern, result[3]);
      result[4] = clone(value, result[4]);
      result[5] = clone(event, result[5]);
      result[6] = clone(key, result[6]);
      result[7] = clone(data, result[7]);
    }
    return result;
  }
  /**
   * @param {?} data
   * @return {?}
   */
  function queue(data) {
    /** @type {Array} */
    var q = [];
    /** @type {number} */
    var i = 0;
    for (;i < data.getLength();++i) {
      q[i * 8 >> 5] |= data.bytes[i] << 24 - i * 8 % 32;
    }
    return q;
  }
  /** @type {number} */
  var c = 8;
  /** @type {number} */
  var j = 0;
  var codeSegments = init(queue(data), data.getLength() * c);
  var bytes = new ByteArray;
  /** @type {number} */
  var i = 0;
  for (;i < codeSegments.length;++i) {
    bytes.appendInt32(codeSegments[i]);
  }
  return bytes;
};
/**
 * @param {?} obj
 * @param {?} dataAndEvents
 * @param {number} parentNode
 * @return {?}
 */
CLCrypto.prototype.rsaEncrypt = function(obj, dataAndEvents, parentNode) {
  /**
   * @param {(Array|number)} results
   * @param {number} i
   * @param {?} l
   * @return {?}
   */
  function makeArray(results, i, l) {
    if (i < results.length + 11) {
      alert("Message too long for RSA");
      return null;
    }
    /** @type {Array} */
    var a = new Array;
    /** @type {number} */
    var num = results.length - 1;
    for (;num >= 0 && i > 0;) {
      a[--i] = results[num--];
    }
    /** @type {number} */
    a[--i] = 0;
    /** @type {Array} */
    var b = new Array;
    for (;i > 2;) {
      if (cltesting === 1) {
        /** @type {number} */
        a[--i] = 9;
      } else {
        /** @type {number} */
        b[0] = 0;
        for (;b[0] == 0;) {
          l.nextBytes(b);
        }
        a[--i] = b[0];
      }
    }
    /** @type {number} */
    a[--i] = 2;
    /** @type {number} */
    a[--i] = 0;
    return new BigInteger(a);
  }
  var jQuery = makeArray(obj.bytes, dataAndEvents.bitLength() + 7 >> 3, this.secureRandom);
  if (jQuery === null) {
    return null;
  }
  var id = jQuery.modPowInt(parentNode, dataAndEvents);
  if (id === null) {
    return null;
  }
  var radixToPower = id.toString(16);
  result = new ByteArray;
  result.fromHex(radixToPower);
  return result;
};
/**
 * @return {undefined}
 */
CLCrypto.prototype.randomSeedTime = function() {
  this.secureRandom.rng_seed_time();
};
/**
 * @param {number} deepDataAndEvents
 * @return {undefined}
 */
CLCrypto.prototype.randomSeed = function(deepDataAndEvents) {
  if (deepDataAndEvents !== null && deepDataAndEvents !== 0) {
    this.secureRandom.rng_seed_int(deepDataAndEvents);
  }
};
/**
 * @param {number} bytes
 * @return {?}
 */
CLCrypto.prototype.getRandomBytes = function(bytes) {
  /** @type {Array} */
  var b = new Array;
  /** @type {Array} */
  var a = new Array;
  /** @type {number} */
  var i = 0;
  for (;i < bytes;++i) {
    /** @type {number} */
    b[0] = 0;
    for (;b[0] == 0;) {
      this.secureRandom.nextBytes(b);
    }
    a[i] = b[0];
  }
  return a;
};
/** @type {number} */
var cltesting = 0;
/**
 * @return {undefined}
 */
ByteArray = function() {
  /** @type {Array} */
  this.bytes = [];
};
/**
 * @return {?}
 */
ByteArray.prototype.getLength = function() {
  return this.bytes.length;
};
/**
 * @param {string} str
 * @return {?}
 */
ByteArray.prototype.fromString = function(str) {
  /** @type {number} */
  this.bytes.length = 0;
  if (str === null) {
    return 0;
  }
  /** @type {number} */
  var i = 0;
  for (;i < str.length;++i) {
    /** @type {number} */
    this.bytes[i] = str.charCodeAt(i) & 255;
  }
  return i;
};
/**
 * @return {?}
 */
ByteArray.prototype.toString = function() {
  /** @type {string} */
  var str = "";
  /** @type {number} */
  var i = 0;
  for (;i < this.bytes.length;++i) {
    str += String.fromCharCode(this.bytes[i]);
  }
  return str;
};
/**
 * @param {string} hex
 * @return {?}
 */
ByteArray.prototype.fromHex = function(hex) {
  /** @type {number} */
  this.bytes.length = 0;
  if (hex === null) {
    return 0;
  }
  if (hex.length % 2 !== 0) {
    /** @type {string} */
    hex = "0" + hex;
  }
  /** @type {number} */
  var i = 0;
  for (;i < hex.length;i += 2) {
    /** @type {number} */
    this.bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return i / 2;
};
/**
 * @return {?}
 */
ByteArray.prototype.toHex = function() {
  if (this.bytes.length === 0) {
    return "";
  }
  /** @type {string} */
  var hex = "";
  /** @type {number} */
  var i = 0;
  for (;i < this.bytes.length;++i) {
    hex += (this.bytes[i] >>> 4).toString(16);
    hex += (this.bytes[i] & 15).toString(16);
  }
  return hex;
};
/**
 * @param {string} arg
 * @return {?}
 */
ByteArray.prototype.fromB64 = function(arg) {
  if (arg === null) {
    return 0;
  }
  if (arg.length % 4 !== 0) {
    return 0;
  }
  /** @type {string} */
  var whitespace = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  /** @type {number} */
  this.bytes.length = 0;
  /** @type {number} */
  var a = 0;
  /** @type {number} */
  var fromB64 = 0;
  /** @type {number} */
  var i = 0;
  for (;i < arg.length;i += 4) {
    /** @type {number} */
    var k = whitespace.indexOf(arg.charAt(i));
    /** @type {number} */
    var h = whitespace.indexOf(arg.charAt(i + 1));
    /** @type {number} */
    var g = whitespace.indexOf(arg.charAt(i + 2));
    /** @type {number} */
    var e = whitespace.indexOf(arg.charAt(i + 3));
    /** @type {number} */
    this.bytes[fromB64++] = (k << 2) + (h >>> 4);
    if (g != 64) {
      /** @type {number} */
      this.bytes[fromB64++] = ((h & 15) << 4) + (g >>> 2);
      if (e != 64) {
        /** @type {number} */
        this.bytes[fromB64++] = ((g & 3) << 6) + e;
      }
    }
  }
  return fromB64;
};
/**
 * @return {?}
 */
ByteArray.prototype.toB64 = function() {
  /** @type {string} */
  var tail = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  /** @type {string} */
  var optsData = "";
  /** @type {number} */
  var j = this.bytes.length % 3;
  /** @type {number} */
  var i = 0;
  for (;i < this.bytes.length - j;i += 3) {
    optsData += tail.charAt(this.bytes[i] >>> 2);
    optsData += tail.charAt(((this.bytes[i] & 3) << 4) + (this.bytes[i + 1] >>> 4));
    optsData += tail.charAt(((this.bytes[i + 1] & 15) << 2) + (this.bytes[i + 2] >>> 6));
    optsData += tail.charAt(this.bytes[i + 2] & 63);
  }
  if (j === 1) {
    optsData += tail.charAt(this.bytes[this.bytes.length - 1] >>> 2);
    optsData += tail.charAt((this.bytes[this.bytes.length - 1] & 3) << 4);
    optsData += "==";
  } else {
    if (j === 2) {
      optsData += tail.charAt(this.bytes[this.bytes.length - 2] >>> 2);
      optsData += tail.charAt(((this.bytes[this.bytes.length - 2] & 3) << 4) + (this.bytes[this.bytes.length - 1] >>> 4));
      optsData += tail.charAt((this.bytes[this.bytes.length - 1] & 15) << 2);
      optsData += "=";
    }
  }
  return optsData;
};
/**
 * @param {number} dataAndEvents
 * @return {?}
 */
ByteArray.prototype.appendInt32 = function(dataAndEvents) {
  var i = this.bytes.length;
  /** @type {number} */
  this.bytes[i] = dataAndEvents >>> 24;
  /** @type {number} */
  this.bytes[i + 1] = dataAndEvents >>> 16 & 255;
  /** @type {number} */
  this.bytes[i + 2] = dataAndEvents >>> 8 & 255;
  /** @type {number} */
  this.bytes[i + 3] = dataAndEvents & 255;
  return 4;
};
/**
 * @param {?} stream
 * @return {?}
 */
ByteArray.prototype.appendByteArray = function(stream) {
  var pad = this.bytes.length;
  /** @type {number} */
  var i = 0;
  for (;i < stream.bytes.length;++i) {
    this.bytes[pad + i] = stream.bytes[i];
  }
  return stream.bytes.length;
};
/**
 * @param {string} items
 * @param {number} offset
 * @param {number} len
 * @return {?}
 */
ByteArray.prototype.appendArray = function(items, offset, len) {
  if (offset === null) {
    /** @type {number} */
    offset = 0;
  }
  if (len === null) {
    /** @type {number} */
    len = items.length - offset;
  }
  var length = this.bytes.length;
  /** @type {number} */
  var from = 0;
  for (;from < len;++from) {
    this.bytes[length + from] = items[from + offset];
  }
  return len;
};
/**
 * @param {number} emptyGet
 * @param {number} bytes
 * @return {undefined}
 */
ByteArray.prototype.unshift = function(emptyGet, bytes) {
  /** @type {number} */
  var i = 0;
  for (;i < bytes;++i) {
    this.bytes.unshift(emptyGet);
  }
};
/**
 * @return {undefined}
 */
ByteArray.prototype.clear = function() {
  /** @type {number} */
  var i = 0;
  for (;i < this.bytes.length;++i) {
    /** @type {number} */
    this.bytes[i] = 0;
  }
};
/**
 * @param {(Object|number)} enc
 * @param {?} pos
 * @return {undefined}
 */
function Stream(enc, pos) {
  if (enc instanceof Stream) {
    this.enc = enc.enc;
    this.pos = enc.pos;
  } else {
    /** @type {(Object|number)} */
    this.enc = enc;
    this.pos = pos;
  }
}
/**
 * @param {number} pos
 * @return {?}
 */
Stream.prototype.get = function(pos) {
  if (pos == undefined) {
    /** @type {number} */
    pos = this.pos++;
  }
  if (pos >= this.enc.length) {
    throw "Requesting byte offset " + pos + " on a stream of length " + this.enc.length;
  }
  return this.enc[pos];
};
/** @type {string} */
Stream.prototype.hexDigits = "0123456789ABCDEF";
/**
 * @param {number} b
 * @return {?}
 */
Stream.prototype.hexByte = function(b) {
  return this.hexDigits.charAt(b >> 4 & 15) + this.hexDigits.charAt(b & 15);
};
/**
 * @param {number} start
 * @param {?} bytes
 * @return {?}
 */
Stream.prototype.hexDump = function(start, bytes) {
  /** @type {string} */
  var s = "";
  /** @type {number} */
  var i = start;
  for (;i < bytes;++i) {
    s += this.hexByte(this.get(i));
    switch(i & 15) {
      case 7:
        s += "  ";
        break;
      case 15:
        s += "\n";
        break;
      default:
        s += " ";
        break;
    }
  }
  return s;
};
/**
 * @param {?} start
 * @param {?} end
 * @return {?}
 */
Stream.prototype.parseStringISO = function(start, end) {
  /** @type {string} */
  var optsData = "";
  var i = start;
  for (;i < end;++i) {
    optsData += String.fromCharCode(this.get(i));
  }
  return optsData;
};
/**
 * @param {?} start
 * @param {?} end
 * @return {?}
 */
Stream.prototype.parseStringUTF = function(start, end) {
  /** @type {string} */
  var s = "";
  /** @type {number} */
  var c = 0;
  var i = start;
  for (;i < end;) {
    c = this.get(i++);
    if (c < 128) {
      s += String.fromCharCode(c);
    } else {
      if (c > 191 && c < 224) {
        s += String.fromCharCode((c & 31) << 6 | this.get(i++) & 63);
      } else {
        s += String.fromCharCode((c & 15) << 12 | (this.get(i++) & 63) << 6 | this.get(i++) & 63);
      }
    }
  }
  return s;
};
/** @type {RegExp} */
Stream.prototype.reTime = /^((?:1[89]|2\d)?\d\d)(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])([01]\d|2[0-3])(?:([0-5]\d)(?:([0-5]\d)(?:[.,](\d{1,3}))?)?)?(Z|[-+](?:[0]\d|1[0-2])([0-5]\d)?)?$/;
/**
 * @param {?} start
 * @param {?} end
 * @return {?}
 */
Stream.prototype.parseTime = function(start, end) {
  var s = this.parseStringISO(start, end);
  var m = this.reTime.exec(s);
  if (!m) {
    return "Unrecognized time: " + s;
  }
  s = m[1] + "-" + m[2] + "-" + m[3] + " " + m[4];
  if (m[5]) {
    s += ":" + m[5];
    if (m[6]) {
      s += ":" + m[6];
      if (m[7]) {
        s += "." + m[7];
      }
    }
  }
  if (m[8]) {
    s += " UTC";
    if (m[8] != "Z") {
      s += m[8];
      if (m[9]) {
        s += ":" + m[9];
      }
    }
  }
  return s;
};
/**
 * @param {number} start
 * @param {number} end
 * @return {?}
 */
Stream.prototype.parseInteger = function(start, end) {
  /** @type {number} */
  var duration = end - start;
  if (duration > 4) {
    duration <<= 3;
    var context = this.get(start);
    if (context == 0) {
      duration -= 8;
    } else {
      for (;context < 128;) {
        context <<= 1;
        --duration;
      }
    }
    return "(" + duration + " bit)";
  }
  /** @type {number} */
  var a = 0;
  /** @type {number} */
  var i = start;
  for (;i < end;++i) {
    /** @type {number} */
    a = a << 8 | this.get(i);
  }
  return a;
};
/**
 * @param {number} start
 * @param {number} end
 * @return {?}
 */
Stream.prototype.parseBitString = function(start, end) {
  var context = this.get(start);
  /** @type {number} */
  var e = (end - start - 1 << 3) - context;
  /** @type {string} */
  var parseBitString = "(" + e + " bit)";
  if (e <= 20) {
    var c = context;
    parseBitString += " ";
    /** @type {number} */
    var i = end - 1;
    for (;i > start;--i) {
      var all = this.get(i);
      var control = c;
      for (;control < 8;++control) {
        parseBitString += all >> control & 1 ? "1" : "0";
      }
      /** @type {number} */
      c = 0;
    }
  }
  return parseBitString;
};
/**
 * @param {number} start
 * @param {?} end
 * @return {?}
 */
Stream.prototype.parseOctetString = function(start, end) {
  /** @type {number} */
  var duration = end - start;
  /** @type {string} */
  var s = "(" + duration + " byte) ";
  if (duration > 20) {
    end = start + 20;
  }
  /** @type {number} */
  var i = start;
  for (;i < end;++i) {
    s += this.hexByte(this.get(i));
  }
  if (duration > 20) {
    s += String.fromCharCode(8230);
  }
  return s;
};
/**
 * @param {?} start
 * @param {?} end
 * @return {?}
 */
Stream.prototype.parseOID = function(start, end) {
  var s;
  /** @type {number} */
  var tmp = 0;
  /** @type {number} */
  var elem = 0;
  var i = start;
  for (;i < end;++i) {
    var all = this.get(i);
    /** @type {number} */
    tmp = tmp << 7 | all & 127;
    elem += 7;
    if (!(all & 128)) {
      if (s == undefined) {
        /** @type {string} */
        s = parseInt(tmp / 40, 10) + "." + tmp % 40;
      } else {
        s += "." + (elem >= 31 ? "bigint" : tmp);
      }
      /** @type {number} */
      tmp = elem = 0;
    }
    s += String.fromCharCode();
  }
  return s;
};
/**
 * @param {Object} stream
 * @param {string} header
 * @param {number} length
 * @param {number} tag
 * @param {string} sub
 * @return {undefined}
 */
function ASN1(stream, header, length, tag, sub) {
  /** @type {Object} */
  this.stream = stream;
  /** @type {string} */
  this.header = header;
  /** @type {number} */
  this.length = length;
  /** @type {number} */
  this.tag = tag;
  /** @type {string} */
  this.sub = sub;
}
/**
 * @return {?}
 */
ASN1.prototype.typeName = function() {
  if (this.tag == undefined) {
    return "unknown";
  }
  /** @type {number} */
  var c = this.tag >> 6;
  /** @type {number} */
  var a = this.tag >> 5 & 1;
  /** @type {number} */
  var dstUri = this.tag & 31;
  switch(c) {
    case 0:
      switch(dstUri) {
        case 0:
          return "EOC";
        case 1:
          return "BOOLEAN";
        case 2:
          return "INTEGER";
        case 3:
          return "BIT_STRING";
        case 4:
          return "OCTET_STRING";
        case 5:
          return "NULL";
        case 6:
          return "OBJECT_IDENTIFIER";
        case 7:
          return "ObjectDescriptor";
        case 8:
          return "EXTERNAL";
        case 9:
          return "REAL";
        case 10:
          return "ENUMERATED";
        case 11:
          return "EMBEDDED_PDV";
        case 12:
          return "UTF8String";
        case 16:
          return "SEQUENCE";
        case 17:
          return "SET";
        case 18:
          return "NumericString";
        case 19:
          return "PrintableString";
        case 20:
          return "TeletexString";
        case 21:
          return "VideotexString";
        case 22:
          return "IA5String";
        case 23:
          return "UTCTime";
        case 24:
          return "GeneralizedTime";
        case 25:
          return "GraphicString";
        case 26:
          return "VisibleString";
        case 27:
          return "GeneralString";
        case 28:
          return "UniversalString";
        case 30:
          return "BMPString";
        default:
          return "Universal_" + dstUri.toString(16);
      }
    ;
    case 1:
      return "Application_" + dstUri.toString(16);
    case 2:
      return "[" + dstUri + "]";
    case 3:
      return "Private_" + dstUri.toString(16);
    default:
      return "unknown";
  }
};
/**
 * @return {?}
 */
ASN1.prototype.content = function() {
  if (this.tag == undefined) {
    return null;
  }
  /** @type {number} */
  var d = this.tag >> 6;
  if (d != 0) {
    return this.sub == null ? null : "(" + this.sub.length + ")";
  }
  /** @type {number} */
  var b = this.tag & 31;
  var content = this.posContent();
  /** @type {number} */
  var len = Math.abs(this.length);
  switch(b) {
    case 1:
      return this.stream.get(content) == 0 ? "false" : "true";
    case 2:
      return this.stream.parseInteger(content, content + len);
    case 3:
      return this.sub ? "(" + this.sub.length + " elem)" : this.stream.parseBitString(content, content + len);
    case 4:
      return this.sub ? "(" + this.sub.length + " elem)" : this.stream.parseOctetString(content, content + len);
    case 6:
      return this.stream.parseOID(content, content + len);
    case 16:
    ;
    case 17:
      return "(" + this.sub.length + " elem)";
    case 12:
      return this.stream.parseStringUTF(content, content + len);
    case 18:
    ;
    case 19:
    ;
    case 20:
    ;
    case 21:
    ;
    case 22:
    ;
    case 26:
      return this.stream.parseStringISO(content, content + len);
    case 23:
    ;
    case 24:
      return this.stream.parseTime(content, content + len);
  }
  return null;
};
/**
 * @return {?}
 */
ASN1.prototype.toString = function() {
  return this.typeName() + "@" + this.stream.pos + "[header:" + this.header + ",length:" + this.length + ",sub:" + (this.sub == null ? "null" : this.sub.length) + "]";
};
/**
 * @param {string} prefix
 * @return {undefined}
 */
ASN1.prototype.print = function(prefix) {
  if (prefix == undefined) {
    /** @type {string} */
    prefix = "";
  }
  document.writeln(prefix + this);
  if (this.sub != null) {
    prefix += "  ";
    /** @type {number} */
    var i = 0;
    var valuesLen = this.sub.length;
    for (;i < valuesLen;++i) {
      this.sub[i].print(prefix);
    }
  }
};
/**
 * @param {string} indent
 * @return {?}
 */
ASN1.prototype.toPrettyString = function(indent) {
  if (indent == undefined) {
    /** @type {string} */
    indent = "";
  }
  /** @type {string} */
  var s = indent + this.typeName() + " @" + this.stream.pos;
  if (this.length >= 0) {
    s += "+";
  }
  s += this.length;
  if (this.tag & 32) {
    s += " (constructed)";
  } else {
    if ((this.tag == 3 || this.tag == 4) && this.sub != null) {
      s += " (encapsulates)";
    }
  }
  s += "\n";
  if (this.sub != null) {
    indent += "  ";
    /** @type {number} */
    var i = 0;
    var valuesLen = this.sub.length;
    for (;i < valuesLen;++i) {
      s += this.sub[i].toPrettyString(indent);
    }
  }
  return s;
};
/**
 * @return {?}
 */
ASN1.prototype.posStart = function() {
  return this.stream.pos;
};
/**
 * @return {?}
 */
ASN1.prototype.posContent = function() {
  return this.stream.pos + this.header;
};
/**
 * @return {?}
 */
ASN1.prototype.posEnd = function() {
  return this.stream.pos + this.header + Math.abs(this.length);
};
/**
 * @param {?} doc
 * @return {undefined}
 */
ASN1.prototype.fakeHover = function(doc) {
  this.node.className += " hover";
  if (doc) {
    this.head.className += " hover";
  }
};
/**
 * @param {?} dataAndEvents
 * @return {undefined}
 */
ASN1.prototype.fakeOut = function(dataAndEvents) {
  /** @type {RegExp} */
  var re = / ?hover/;
  this.node.className = this.node.className.replace(re, "");
  if (dataAndEvents) {
    this.head.className = this.head.className.replace(re, "");
  }
};
/**
 * @param {Object} stream
 * @return {?}
 */
ASN1.decodeLength = function(stream) {
  var buf = stream.get();
  /** @type {number} */
  var len = buf & 127;
  if (len == buf) {
    return len;
  }
  if (len > 3) {
    throw "Length over 24 bits not supported at position " + (stream.pos - 1);
  }
  if (len == 0) {
    return-1;
  }
  /** @type {number} */
  buf = 0;
  /** @type {number} */
  var i = 0;
  for (;i < len;++i) {
    /** @type {number} */
    buf = buf << 8 | stream.get();
  }
  return buf;
};
/**
 * @param {number} value
 * @param {?} len
 * @param {Object} data
 * @return {?}
 */
ASN1.hasContent = function(value, len, data) {
  if (value & 32) {
    return true;
  }
  if (value < 3 || value > 4) {
    return false;
  }
  var stream = new Stream(data);
  if (value == 3) {
    stream.get();
  }
  var e = stream.get();
  if (e >> 6 & 1) {
    return false;
  }
  try {
    var i = ASN1.decodeLength(stream);
    return stream.pos - data.pos + i == len;
  } catch (c) {
    return false;
  }
};
/**
 * @param {Object} stream
 * @return {?}
 */
ASN1.decode = function(stream) {
  if (!(stream instanceof Stream)) {
    stream = new Stream(stream, 0);
  }
  var streamStart = new Stream(stream);
  var udataCur = stream.get();
  var len = ASN1.decodeLength(stream);
  /** @type {number} */
  var header = stream.pos - streamStart.pos;
  /** @type {null} */
  var sub = null;
  if (ASN1.hasContent(udataCur, len, stream)) {
    var start = stream.pos;
    if (udataCur == 3) {
      stream.get();
    }
    /** @type {Array} */
    sub = [];
    if (len >= 0) {
      var end = start + len;
      for (;stream.pos < end;) {
        sub[sub.length] = ASN1.decode(stream);
      }
      if (stream.pos != end) {
        throw "Content size is not correct for container starting at offset " + start;
      }
    } else {
      try {
        for (;;) {
          var s = ASN1.decode(stream);
          if (s.tag == 0) {
            break;
          }
          sub[sub.length] = s;
        }
        /** @type {number} */
        len = start - stream.pos;
      } catch (g) {
        throw "Exception while decoding undefined length content: " + g;
      }
    }
  } else {
    stream.pos += len;
  }
  return new ASN1(streamStart, header, len, udataCur, sub);
};
var dbits;
/** @type {number} */
var canary = 0xdeadbeefcafe;
/** @type {boolean} */
var j_lm = (canary & 16777215) == 15715070;
/**
 * @param {(number|string)} a
 * @param {number} attributes
 * @param {number} deepDataAndEvents
 * @return {undefined}
 */
function BigInteger(a, attributes, deepDataAndEvents) {
  if (a != null) {
    if ("number" == typeof a) {
      this.fromNumber(a, attributes, deepDataAndEvents);
    } else {
      if (attributes == null && "string" != typeof a) {
        this.fromString(a, 256);
      } else {
        this.fromString(a, attributes);
      }
    }
  }
}
/**
 * @return {?}
 */
function nbi() {
  return new BigInteger(null);
}
/**
 * @param {number} recurring
 * @param {number} deepDataAndEvents
 * @param {Object} object
 * @param {number} i
 * @param {number} mayParseLabeledStatementInstead
 * @param {number} dataAndEvents
 * @return {?}
 */
function am1(recurring, deepDataAndEvents, object, i, mayParseLabeledStatementInstead, dataAndEvents) {
  for (;--dataAndEvents >= 0;) {
    var sectionLength = deepDataAndEvents * this[recurring++] + object[i] + mayParseLabeledStatementInstead;
    /** @type {number} */
    mayParseLabeledStatementInstead = Math.floor(sectionLength / 67108864);
    /** @type {number} */
    object[i++] = sectionLength & 67108863;
  }
  return mayParseLabeledStatementInstead;
}
/**
 * @param {number} recurring
 * @param {number} deepDataAndEvents
 * @param {Object} object
 * @param {number} i
 * @param {number} mayParseLabeledStatementInstead
 * @param {number} dataAndEvents
 * @return {?}
 */
function am2(recurring, deepDataAndEvents, object, i, mayParseLabeledStatementInstead, dataAndEvents) {
  /** @type {number} */
  var s1 = deepDataAndEvents & 32767;
  /** @type {number} */
  var c1 = deepDataAndEvents >> 15;
  for (;--dataAndEvents >= 0;) {
    /** @type {number} */
    var s2 = this[recurring] & 32767;
    /** @type {number} */
    var c2 = this[recurring++] >> 15;
    /** @type {number} */
    var b = c1 * s2 + c2 * s1;
    s2 = s1 * s2 + ((b & 32767) << 15) + object[i] + (mayParseLabeledStatementInstead & 1073741823);
    /** @type {number} */
    mayParseLabeledStatementInstead = (s2 >>> 30) + (b >>> 15) + c1 * c2 + (mayParseLabeledStatementInstead >>> 30);
    /** @type {number} */
    object[i++] = s2 & 1073741823;
  }
  return mayParseLabeledStatementInstead;
}
/**
 * @param {number} recurring
 * @param {number} deepDataAndEvents
 * @param {Object} object
 * @param {number} i
 * @param {number} mayParseLabeledStatementInstead
 * @param {number} dataAndEvents
 * @return {?}
 */
function am3(recurring, deepDataAndEvents, object, i, mayParseLabeledStatementInstead, dataAndEvents) {
  /** @type {number} */
  var r10 = deepDataAndEvents & 16383;
  /** @type {number} */
  var m10 = deepDataAndEvents >> 14;
  for (;--dataAndEvents >= 0;) {
    /** @type {number} */
    var r00 = this[recurring] & 16383;
    /** @type {number} */
    var m11 = this[recurring++] >> 14;
    /** @type {number} */
    var y = m10 * r00 + m11 * r10;
    r00 = r10 * r00 + ((y & 16383) << 14) + object[i] + mayParseLabeledStatementInstead;
    /** @type {number} */
    mayParseLabeledStatementInstead = (r00 >> 28) + (y >> 14) + m10 * m11;
    /** @type {number} */
    object[i++] = r00 & 268435455;
  }
  return mayParseLabeledStatementInstead;
}
if (j_lm && navigator.appName == "Microsoft Internet Explorer") {
  /** @type {function (number, number, Object, number, number, number): ?} */
  BigInteger.prototype.am = am2;
  /** @type {number} */
  dbits = 30;
} else {
  if (j_lm && navigator.appName != "Netscape") {
    /** @type {function (number, number, Object, number, number, number): ?} */
    BigInteger.prototype.am = am1;
    /** @type {number} */
    dbits = 26;
  } else {
    /** @type {function (number, number, Object, number, number, number): ?} */
    BigInteger.prototype.am = am3;
    /** @type {number} */
    dbits = 28;
  }
}
/** @type {number} */
BigInteger.prototype.DB = dbits;
/** @type {number} */
BigInteger.prototype.DM = (1 << dbits) - 1;
/** @type {number} */
BigInteger.prototype.DV = 1 << dbits;
/** @type {number} */
var BI_FP = 52;
/** @type {number} */
BigInteger.prototype.FV = Math.pow(2, BI_FP);
/** @type {number} */
BigInteger.prototype.F1 = BI_FP - dbits;
/** @type {number} */
BigInteger.prototype.F2 = 2 * dbits - BI_FP;
/** @type {string} */
var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
/** @type {Array} */
var BI_RC = new Array;
var rr;
var vv;
/** @type {number} */
rr = "0".charCodeAt(0);
/** @type {number} */
vv = 0;
for (;vv <= 9;++vv) {
  /** @type {number} */
  BI_RC[rr++] = vv;
}
/** @type {number} */
rr = "a".charCodeAt(0);
/** @type {number} */
vv = 10;
for (;vv < 36;++vv) {
  /** @type {number} */
  BI_RC[rr++] = vv;
}
/** @type {number} */
rr = "A".charCodeAt(0);
/** @type {number} */
vv = 10;
for (;vv < 36;++vv) {
  /** @type {number} */
  BI_RC[rr++] = vv;
}
/**
 * @param {?} o2
 * @return {?}
 */
function int2char(o2) {
  return BI_RM.charAt(o2);
}
/**
 * @param {string} object
 * @param {number} n
 * @return {?}
 */
function intAt(object, n) {
  var deepDataAndEvents = BI_RC[object.charCodeAt(n)];
  return deepDataAndEvents == null ? -1 : deepDataAndEvents;
}
/**
 * @param {Object} x
 * @return {undefined}
 */
function bnpCopyTo(x) {
  /** @type {number} */
  var funcs = this.t - 1;
  for (;funcs >= 0;--funcs) {
    x[funcs] = this[funcs];
  }
  x.t = this.t;
  x.s = this.s;
}
/**
 * @param {number} recurring
 * @return {undefined}
 */
function bnpFromInt(recurring) {
  /** @type {number} */
  this.t = 1;
  /** @type {number} */
  this.s = recurring < 0 ? -1 : 0;
  if (recurring > 0) {
    /** @type {number} */
    this[0] = recurring;
  } else {
    if (recurring < -1) {
      this[0] = recurring + DV;
    } else {
      /** @type {number} */
      this.t = 0;
    }
  }
}
/**
 * @param {number} recurring
 * @return {?}
 */
function nbv(recurring) {
  var content = nbi();
  content.fromInt(recurring);
  return content;
}
/**
 * @param {string} str
 * @param {number} opt_attributes
 * @return {undefined}
 */
function bnpFromString(str, opt_attributes) {
  var object;
  if (opt_attributes == 16) {
    /** @type {number} */
    object = 4;
  } else {
    if (opt_attributes == 8) {
      /** @type {number} */
      object = 3;
    } else {
      if (opt_attributes == 256) {
        /** @type {number} */
        object = 8;
      } else {
        if (opt_attributes == 2) {
          /** @type {number} */
          object = 1;
        } else {
          if (opt_attributes == 32) {
            /** @type {number} */
            object = 5;
          } else {
            if (opt_attributes == 4) {
              /** @type {number} */
              object = 2;
            } else {
              this.fromRadix(str, opt_attributes);
              return;
            }
          }
        }
      }
    }
  }
  /** @type {number} */
  this.t = 0;
  /** @type {number} */
  this.s = 0;
  var i = str.length;
  /** @type {boolean} */
  var d = false;
  /** @type {number} */
  var count = 0;
  for (;--i >= 0;) {
    var val = object == 8 ? str[i] & 255 : intAt(str, i);
    if (val < 0) {
      if (str.charAt(i) == "-") {
        /** @type {boolean} */
        d = true;
      }
      continue;
    }
    /** @type {boolean} */
    d = false;
    if (count == 0) {
      this[this.t++] = val;
    } else {
      if (count + object > this.DB) {
        this[this.t - 1] |= (val & (1 << this.DB - count) - 1) << count;
        /** @type {number} */
        this[this.t++] = val >> this.DB - count;
      } else {
        this[this.t - 1] |= val << count;
      }
    }
    count += object;
    if (count >= this.DB) {
      count -= this.DB;
    }
  }
  if (object == 8 && (str[0] & 128) != 0) {
    /** @type {number} */
    this.s = -1;
    if (count > 0) {
      this[this.t - 1] |= (1 << this.DB - count) - 1 << count;
    }
  }
  this.clamp();
  if (d) {
    BigInteger.ZERO.subTo(this, this);
  }
}
/**
 * @return {undefined}
 */
function bnpClamp() {
  /** @type {number} */
  var a = this.s & this.DM;
  for (;this.t > 0 && this[this.t - 1] == a;) {
    --this.t;
  }
}
/**
 * @param {number} opt_attributes
 * @return {?}
 */
function bnToString(opt_attributes) {
  if (this.s < 0) {
    return "-" + this.negate().toString(opt_attributes);
  }
  var right;
  if (opt_attributes == 16) {
    /** @type {number} */
    right = 4;
  } else {
    if (opt_attributes == 8) {
      /** @type {number} */
      right = 3;
    } else {
      if (opt_attributes == 2) {
        /** @type {number} */
        right = 1;
      } else {
        if (opt_attributes == 32) {
          /** @type {number} */
          right = 5;
        } else {
          if (opt_attributes == 4) {
            /** @type {number} */
            right = 2;
          } else {
            return this.toRadix(opt_attributes);
          }
        }
      }
    }
  }
  /** @type {number} */
  var g = (1 << right) - 1;
  var o;
  /** @type {boolean} */
  var disableLoopProtection = false;
  /** @type {string} */
  var code = "";
  var t = this.t;
  /** @type {number} */
  var left = this.DB - t * this.DB % right;
  if (t-- > 0) {
    if (left < this.DB && (o = this[t] >> left) > 0) {
      /** @type {boolean} */
      disableLoopProtection = true;
      code = int2char(o);
    }
    for (;t >= 0;) {
      if (left < right) {
        /** @type {number} */
        o = (this[t] & (1 << left) - 1) << right - left;
        o |= this[--t] >> (left += this.DB - right);
      } else {
        /** @type {number} */
        o = this[t] >> (left -= right) & g;
        if (left <= 0) {
          left += this.DB;
          --t;
        }
      }
      if (o > 0) {
        /** @type {boolean} */
        disableLoopProtection = true;
      }
      if (disableLoopProtection) {
        code += int2char(o);
      }
    }
  }
  return disableLoopProtection ? code : "0";
}
/**
 * @return {?}
 */
function bnNegate() {
  var camelKey = nbi();
  BigInteger.ZERO.subTo(this, camelKey);
  return camelKey;
}
/**
 * @return {?}
 */
function bnAbs() {
  return this.s < 0 ? this.negate() : this;
}
/**
 * @param {?} o
 * @return {?}
 */
function bnCompareTo(o) {
  /** @type {number} */
  var s2 = this.s - o.s;
  if (s2 != 0) {
    return s2;
  }
  var t = this.t;
  /** @type {number} */
  s2 = t - o.t;
  if (s2 != 0) {
    return s2;
  }
  for (;--t >= 0;) {
    if ((s2 = this[t] - o[t]) != 0) {
      return s2;
    }
  }
  return 0;
}
/**
 * @param {number} dataAndEvents
 * @return {?}
 */
function nbits(dataAndEvents) {
  /** @type {number} */
  var nbits = 1;
  var b;
  if ((b = dataAndEvents >>> 16) != 0) {
    /** @type {number} */
    dataAndEvents = b;
    nbits += 16;
  }
  if ((b = dataAndEvents >> 8) != 0) {
    /** @type {number} */
    dataAndEvents = b;
    nbits += 8;
  }
  if ((b = dataAndEvents >> 4) != 0) {
    /** @type {number} */
    dataAndEvents = b;
    nbits += 4;
  }
  if ((b = dataAndEvents >> 2) != 0) {
    /** @type {number} */
    dataAndEvents = b;
    nbits += 2;
  }
  if ((b = dataAndEvents >> 1) != 0) {
    /** @type {number} */
    dataAndEvents = b;
    nbits += 1;
  }
  return nbits;
}
/**
 * @return {?}
 */
function bnBitLength() {
  if (this.t <= 0) {
    return 0;
  }
  return this.DB * (this.t - 1) + nbits(this[this.t - 1] ^ this.s & this.DM);
}
/**
 * @param {number} i
 * @param {Object} o
 * @return {undefined}
 */
function bnpDLShiftTo(i, o) {
  var j;
  /** @type {number} */
  j = this.t - 1;
  for (;j >= 0;--j) {
    o[j + i] = this[j];
  }
  /** @type {number} */
  j = i - 1;
  for (;j >= 0;--j) {
    /** @type {number} */
    o[j] = 0;
  }
  o.t = this.t + i;
  o.s = this.s;
}
/**
 * @param {number} count
 * @param {Object} x
 * @return {undefined}
 */
function bnpDRShiftTo(count, x) {
  /** @type {number} */
  var i = count;
  for (;i < this.t;++i) {
    x[i - count] = this[i];
  }
  /** @type {number} */
  x.t = Math.max(this.t - count, 0);
  x.s = this.s;
}
/**
 * @param {number} m1
 * @param {Object} data
 * @return {undefined}
 */
function bnpLShiftTo(m1, data) {
  /** @type {number} */
  var clientTop = m1 % this.DB;
  /** @type {number} */
  var top = this.DB - clientTop;
  /** @type {number} */
  var g = (1 << top) - 1;
  /** @type {number} */
  var curr = Math.floor(m1 / this.DB);
  /** @type {number} */
  var value = this.s << clientTop & this.DM;
  var diff;
  /** @type {number} */
  diff = this.t - 1;
  for (;diff >= 0;--diff) {
    /** @type {number} */
    data[diff + curr + 1] = this[diff] >> top | value;
    /** @type {number} */
    value = (this[diff] & g) << clientTop;
  }
  /** @type {number} */
  diff = curr - 1;
  for (;diff >= 0;--diff) {
    /** @type {number} */
    data[diff] = 0;
  }
  /** @type {number} */
  data[curr] = value;
  data.t = this.t + curr + 1;
  data.s = this.s;
  data.clamp();
}
/**
 * @param {number} dataAndEvents
 * @param {Object} key
 * @return {undefined}
 */
function bnpRShiftTo(dataAndEvents, key) {
  key.s = this.s;
  /** @type {number} */
  var minX = Math.floor(dataAndEvents / this.DB);
  if (minX >= this.t) {
    /** @type {number} */
    key.t = 0;
    return;
  }
  /** @type {number} */
  var clientTop = dataAndEvents % this.DB;
  /** @type {number} */
  var top = this.DB - clientTop;
  /** @type {number} */
  var s = (1 << clientTop) - 1;
  /** @type {number} */
  key[0] = this[minX] >> clientTop;
  /** @type {number} */
  var maxX = minX + 1;
  for (;maxX < this.t;++maxX) {
    key[maxX - minX - 1] |= (this[maxX] & s) << top;
    /** @type {number} */
    key[maxX - minX] = this[maxX] >> clientTop;
  }
  if (clientTop > 0) {
    key[this.t - minX - 1] |= (this.s & s) << top;
  }
  /** @type {number} */
  key.t = this.t - minX;
  key.clamp();
}
/**
 * @param {Object} obj
 * @param {Object} key
 * @return {undefined}
 */
function bnpSubTo(obj, key) {
  /** @type {number} */
  var i = 0;
  /** @type {number} */
  var value = 0;
  /** @type {number} */
  var padLength = Math.min(obj.t, this.t);
  for (;i < padLength;) {
    value += this[i] - obj[i];
    /** @type {number} */
    key[i++] = value & this.DM;
    value >>= this.DB;
  }
  if (obj.t < this.t) {
    value -= obj.s;
    for (;i < this.t;) {
      value += this[i];
      /** @type {number} */
      key[i++] = value & this.DM;
      value >>= this.DB;
    }
    value += this.s;
  } else {
    value += this.s;
    for (;i < obj.t;) {
      value -= obj[i];
      /** @type {number} */
      key[i++] = value & this.DM;
      value >>= this.DB;
    }
    value -= obj.s;
  }
  /** @type {number} */
  key.s = value < 0 ? -1 : 0;
  if (value < -1) {
    key[i++] = this.DV + value;
  } else {
    if (value > 0) {
      key[i++] = value;
    }
  }
  /** @type {number} */
  key.t = i;
  key.clamp();
}
/**
 * @param {Node} value
 * @param {Object} x
 * @return {undefined}
 */
function bnpMultiplyTo(value, x) {
  var self = this.abs();
  var result = value.abs();
  var i = self.t;
  x.t = i + result.t;
  for (;--i >= 0;) {
    /** @type {number} */
    x[i] = 0;
  }
  /** @type {number} */
  i = 0;
  for (;i < result.t;++i) {
    x[i + self.t] = self.am(0, result[i], x, i, 0, self.t);
  }
  /** @type {number} */
  x.s = 0;
  x.clamp();
  if (this.s != value.s) {
    BigInteger.ZERO.subTo(x, x);
  }
}
/**
 * @param {Object} x
 * @return {undefined}
 */
function bnpSquareTo(x) {
  var self = this.abs();
  /** @type {number} */
  var i = x.t = 2 * self.t;
  for (;--i >= 0;) {
    /** @type {number} */
    x[i] = 0;
  }
  /** @type {number} */
  i = 0;
  for (;i < self.t - 1;++i) {
    var details = self.am(i, self[i], x, 2 * i, 0, 1);
    if ((x[i + self.t] += self.am(i + 1, 2 * self[i], x, 2 * i + 1, details, self.t - i - 1)) >= self.DV) {
      x[i + self.t] -= self.DV;
      /** @type {number} */
      x[i + self.t + 1] = 1;
    }
  }
  if (x.t > 0) {
    x[x.t - 1] += self.am(i, self[i], x, 2 * i, 0, 1);
  }
  /** @type {number} */
  x.s = 0;
  x.clamp();
}
/**
 * @param {Object} value
 * @param {?} recurring
 * @param {Object} a
 * @return {undefined}
 */
function bnpDivRemTo(value, recurring, a) {
  var c = value.abs();
  if (c.t <= 0) {
    return;
  }
  var jQuery = this.abs();
  if (jQuery.t < c.t) {
    if (recurring != null) {
      recurring.fromInt(0);
    }
    if (a != null) {
      this.copyTo(a);
    }
    return;
  }
  if (a == null) {
    a = nbi();
  }
  var d = nbi();
  var tmp_str = this.s;
  var s = value.s;
  /** @type {number} */
  var node = this.DB - nbits(c[c.t - 1]);
  if (node > 0) {
    c.lShiftTo(node, d);
    jQuery.lShiftTo(node, a);
  } else {
    c.copyTo(d);
    jQuery.copyTo(a);
  }
  var t = d.t;
  var item = d[t - 1];
  if (item == 0) {
    return;
  }
  /** @type {number} */
  var det3 = item * (1 << this.F1) + (t > 1 ? d[t - 2] >> this.F2 : 0);
  /** @type {number} */
  var x = this.FV / det3;
  /** @type {number} */
  var y = (1 << this.F1) / det3;
  /** @type {number} */
  var out = 1 << this.F2;
  var i = a.t;
  /** @type {number} */
  var classNames = i - t;
  var b = recurring == null ? nbi() : recurring;
  d.dlShiftTo(classNames, b);
  if (a.compareTo(b) >= 0) {
    /** @type {number} */
    a[a.t++] = 1;
    a.subTo(b, a);
  }
  BigInteger.ONE.dlShiftTo(t, b);
  b.subTo(d, d);
  for (;d.t < t;) {
    /** @type {number} */
    d[d.t++] = 0;
  }
  for (;--classNames >= 0;) {
    var deepDataAndEvents = a[--i] == item ? this.DM : Math.floor(a[i] * x + (a[i - 1] + out) * y);
    if ((a[i] += d.am(0, deepDataAndEvents, a, classNames, 0, t)) < deepDataAndEvents) {
      d.dlShiftTo(classNames, b);
      a.subTo(b, a);
      for (;a[i] < --deepDataAndEvents;) {
        a.subTo(b, a);
      }
    }
  }
  if (recurring != null) {
    a.drShiftTo(t, recurring);
    if (tmp_str != s) {
      BigInteger.ZERO.subTo(recurring, recurring);
    }
  }
  a.t = t;
  a.clamp();
  if (node > 0) {
    a.rShiftTo(node, a);
  }
  if (tmp_str < 0) {
    BigInteger.ZERO.subTo(a, a);
  }
}
/**
 * @param {Object} jQuery
 * @return {?}
 */
function bnMod(jQuery) {
  var a = nbi();
  this.abs().divRemTo(jQuery, null, a);
  if (this.s < 0 && a.compareTo(BigInteger.ZERO) > 0) {
    jQuery.subTo(a, a);
  }
  return a;
}
/**
 * @param {Object} m
 * @return {undefined}
 */
function Classic(m) {
  /** @type {Object} */
  this.m = m;
}
/**
 * @param {Node} x
 * @return {?}
 */
function cConvert(x) {
  if (x.s < 0 || x.compareTo(this.m) >= 0) {
    return x.mod(this.m);
  } else {
    return x;
  }
}
/**
 * @param {?} x
 * @return {?}
 */
function cRevert(x) {
  return x;
}
/**
 * @param {Object} x
 * @return {undefined}
 */
function cReduce(x) {
  x.divRemTo(this.m, null, x);
}
/**
 * @param {?} coordinates
 * @param {Node} result
 * @param {Object} ll
 * @return {undefined}
 */
function cMulTo(coordinates, result, ll) {
  coordinates.multiplyTo(result, ll);
  this.reduce(ll);
}
/**
 * @param {?} x
 * @param {Object} ll
 * @return {undefined}
 */
function cSqrTo(x, ll) {
  x.squareTo(ll);
  this.reduce(ll);
}
/** @type {function (Node): ?} */
Classic.prototype.convert = cConvert;
/** @type {function (?): ?} */
Classic.prototype.revert = cRevert;
/** @type {function (Object): undefined} */
Classic.prototype.reduce = cReduce;
/** @type {function (?, Node, Object): undefined} */
Classic.prototype.mulTo = cMulTo;
/** @type {function (?, Object): undefined} */
Classic.prototype.sqrTo = cSqrTo;
/**
 * @return {?}
 */
function bnpInvDigit() {
  if (this.t < 1) {
    return 0;
  }
  var c = this[0];
  if ((c & 1) == 0) {
    return 0;
  }
  /** @type {number} */
  var b = c & 3;
  /** @type {number} */
  b = b * (2 - (c & 15) * b) & 15;
  /** @type {number} */
  b = b * (2 - (c & 255) * b) & 255;
  /** @type {number} */
  b = b * (2 - ((c & 65535) * b & 65535)) & 65535;
  /** @type {number} */
  b = b * (2 - c * b % this.DV) % this.DV;
  return b > 0 ? this.DV - b : -b;
}
/**
 * @param {Object} m
 * @return {undefined}
 */
function Montgomery(m) {
  /** @type {Object} */
  this.m = m;
  this.mp = m.invDigit();
  /** @type {number} */
  this.mpl = this.mp & 32767;
  /** @type {number} */
  this.mph = this.mp >> 15;
  /** @type {number} */
  this.um = (1 << m.DB - 15) - 1;
  /** @type {number} */
  this.mt2 = 2 * m.t;
}
/**
 * @param {?} x
 * @return {?}
 */
function montConvert(x) {
  var a = nbi();
  x.abs().dlShiftTo(this.m.t, a);
  a.divRemTo(this.m, null, a);
  if (x.s < 0 && a.compareTo(BigInteger.ZERO) > 0) {
    this.m.subTo(a, a);
  }
  return a;
}
/**
 * @param {?} x
 * @return {?}
 */
function montRevert(x) {
  var ll = nbi();
  x.copyTo(ll);
  this.reduce(ll);
  return ll;
}
/**
 * @param {Object} x
 * @return {undefined}
 */
function montReduce(x) {
  for (;x.t <= this.mt2;) {
    /** @type {number} */
    x[x.t++] = 0;
  }
  /** @type {number} */
  var dataName = 0;
  for (;dataName < this.m.t;++dataName) {
    /** @type {number} */
    var functionName = x[dataName] & 32767;
    /** @type {number} */
    var deepDataAndEvents = functionName * this.mpl + ((functionName * this.mph + (x[dataName] >> 15) * this.mpl & this.um) << 15) & x.DM;
    functionName = dataName + this.m.t;
    x[functionName] += this.m.am(0, deepDataAndEvents, x, dataName, 0, this.m.t);
    for (;x[functionName] >= x.DV;) {
      x[functionName] -= x.DV;
      x[++functionName]++;
    }
  }
  x.clamp();
  x.drShiftTo(this.m.t, x);
  if (x.compareTo(this.m) >= 0) {
    x.subTo(this.m, x);
  }
}
/**
 * @param {?} x
 * @param {Object} ll
 * @return {undefined}
 */
function montSqrTo(x, ll) {
  x.squareTo(ll);
  this.reduce(ll);
}
/**
 * @param {?} coordinates
 * @param {Node} result
 * @param {Object} ll
 * @return {undefined}
 */
function montMulTo(coordinates, result, ll) {
  coordinates.multiplyTo(result, ll);
  this.reduce(ll);
}
/** @type {function (?): ?} */
Montgomery.prototype.convert = montConvert;
/** @type {function (?): ?} */
Montgomery.prototype.revert = montRevert;
/** @type {function (Object): undefined} */
Montgomery.prototype.reduce = montReduce;
/** @type {function (?, Node, Object): undefined} */
Montgomery.prototype.mulTo = montMulTo;
/** @type {function (?, Object): undefined} */
Montgomery.prototype.sqrTo = montSqrTo;
/**
 * @return {?}
 */
function bnpIsEven() {
  return(this.t > 0 ? this[0] & 1 : this.s) == 0;
}
/**
 * @param {number} dataAndEvents
 * @param {Object} field
 * @return {?}
 */
function bnpExp(dataAndEvents, field) {
  if (dataAndEvents > 4294967295 || dataAndEvents < 1) {
    return BigInteger.ONE;
  }
  var ll = nbi();
  var coordinates = nbi();
  var expectationResult = field.convert(this);
  /** @type {number} */
  var c = nbits(dataAndEvents) - 1;
  expectationResult.copyTo(ll);
  for (;--c >= 0;) {
    field.sqrTo(ll, coordinates);
    if ((dataAndEvents & 1 << c) > 0) {
      field.mulTo(coordinates, expectationResult, ll);
    } else {
      var coords = ll;
      ll = coordinates;
      coordinates = coords;
    }
  }
  return field.revert(ll);
}
/**
 * @param {number} node
 * @param {?} dataAndEvents
 * @return {?}
 */
function bnModPowInt(node, dataAndEvents) {
  var errorField;
  if (node < 256 || dataAndEvents.isEven()) {
    errorField = new Classic(dataAndEvents);
  } else {
    errorField = new Montgomery(dataAndEvents);
  }
  return this.exp(node, errorField);
}
/** @type {function (Object): undefined} */
BigInteger.prototype.copyTo = bnpCopyTo;
/** @type {function (number): undefined} */
BigInteger.prototype.fromInt = bnpFromInt;
/** @type {function (string, number): undefined} */
BigInteger.prototype.fromString = bnpFromString;
/** @type {function (): undefined} */
BigInteger.prototype.clamp = bnpClamp;
/** @type {function (number, Object): undefined} */
BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
/** @type {function (number, Object): undefined} */
BigInteger.prototype.drShiftTo = bnpDRShiftTo;
/** @type {function (number, Object): undefined} */
BigInteger.prototype.lShiftTo = bnpLShiftTo;
/** @type {function (number, Object): undefined} */
BigInteger.prototype.rShiftTo = bnpRShiftTo;
/** @type {function (Object, Object): undefined} */
BigInteger.prototype.subTo = bnpSubTo;
/** @type {function (Node, Object): undefined} */
BigInteger.prototype.multiplyTo = bnpMultiplyTo;
/** @type {function (Object): undefined} */
BigInteger.prototype.squareTo = bnpSquareTo;
/** @type {function (Object, ?, Object): undefined} */
BigInteger.prototype.divRemTo = bnpDivRemTo;
/** @type {function (): ?} */
BigInteger.prototype.invDigit = bnpInvDigit;
/** @type {function (): ?} */
BigInteger.prototype.isEven = bnpIsEven;
/** @type {function (number, Object): ?} */
BigInteger.prototype.exp = bnpExp;
/** @type {function (number): ?} */
BigInteger.prototype.toString = bnToString;
/** @type {function (): ?} */
BigInteger.prototype.negate = bnNegate;
/** @type {function (): ?} */
BigInteger.prototype.abs = bnAbs;
/** @type {function (?): ?} */
BigInteger.prototype.compareTo = bnCompareTo;
/** @type {function (): ?} */
BigInteger.prototype.bitLength = bnBitLength;
/** @type {function (Object): ?} */
BigInteger.prototype.mod = bnMod;
/** @type {function (number, ?): ?} */
BigInteger.prototype.modPowInt = bnModPowInt;
BigInteger.ZERO = nbv(0);
BigInteger.ONE = nbv(1);
/**
 * @return {?}
 */
function bnClone() {
  var ll = nbi();
  this.copyTo(ll);
  return ll;
}
/**
 * @return {?}
 */
function bnIntValue() {
  if (this.s < 0) {
    if (this.t == 1) {
      return this[0] - this.DV;
    } else {
      if (this.t == 0) {
        return-1;
      }
    }
  } else {
    if (this.t == 1) {
      return this[0];
    } else {
      if (this.t == 0) {
        return 0;
      }
    }
  }
  return(this[1] & (1 << 32 - this.DB) - 1) << this.DB | this[0];
}
/**
 * @return {?}
 */
function bnByteValue() {
  return this.t == 0 ? this.s : this[0] << 24 >> 24;
}
/**
 * @return {?}
 */
function bnShortValue() {
  return this.t == 0 ? this.s : this[0] << 16 >> 16;
}
/**
 * @param {number} a
 * @return {?}
 */
function bnpChunkSize(a) {
  return Math.floor(Math.LN2 * this.DB / Math.log(a));
}
/**
 * @return {?}
 */
function bnSigNum() {
  if (this.s < 0) {
    return-1;
  } else {
    if (this.t <= 0 || this.t == 1 && this[0] <= 0) {
      return 0;
    } else {
      return 1;
    }
  }
}
/**
 * @param {number} value
 * @return {?}
 */
function bnpToRadix(value) {
  if (value == null) {
    /** @type {number} */
    value = 10;
  }
  if (this.signum() == 0 || (value < 2 || value > 36)) {
    return "0";
  }
  var f = this.chunkSize(value);
  /** @type {number} */
  var key = Math.pow(value, f);
  var camelKey = nbv(key);
  var recurring = nbi();
  var QUnit = nbi();
  /** @type {string} */
  var expression = "";
  this.divRemTo(camelKey, recurring, QUnit);
  for (;recurring.signum() > 0;) {
    expression = (key + QUnit.intValue()).toString(value).substr(1) + expression;
    recurring.divRemTo(camelKey, recurring, QUnit);
  }
  return QUnit.intValue().toString(value) + expression;
}
/**
 * @param {string} s
 * @param {number} p
 * @return {undefined}
 */
function bnpFromRadix(s, p) {
  this.fromInt(0);
  if (p == null) {
    /** @type {number} */
    p = 10;
  }
  var bits = this.chunkSize(p);
  /** @type {number} */
  var x = Math.pow(p, bits);
  /** @type {boolean} */
  var e = false;
  /** @type {number} */
  var exponent = 0;
  /** @type {number} */
  var end = 0;
  /** @type {number} */
  var i = 0;
  for (;i < s.length;++i) {
    var start = intAt(s, i);
    if (start < 0) {
      if (s.charAt(i) == "-" && this.signum() == 0) {
        /** @type {boolean} */
        e = true;
      }
      continue;
    }
    end = p * end + start;
    if (++exponent >= bits) {
      this.dMultiply(x);
      this.dAddOffset(end, 0);
      /** @type {number} */
      exponent = 0;
      /** @type {number} */
      end = 0;
    }
  }
  if (exponent > 0) {
    this.dMultiply(Math.pow(p, exponent));
    this.dAddOffset(end, 0);
  }
  if (e) {
    BigInteger.ZERO.subTo(this, this);
  }
}
/**
 * @param {number} v02
 * @param {number} b
 * @param {number} deepDataAndEvents
 * @return {undefined}
 */
function bnpFromNumber(v02, b, deepDataAndEvents) {
  if ("number" == typeof b) {
    if (v02 < 2) {
      this.fromInt(1);
    } else {
      this.fromNumber(v02, deepDataAndEvents);
      if (!this.testBit(v02 - 1)) {
        this.bitwiseTo(BigInteger.ONE.shiftLeft(v02 - 1), op_or, this);
      }
      if (this.isEven()) {
        this.dAddOffset(1, 0);
      }
      for (;!this.isProbablePrime(b);) {
        this.dAddOffset(2, 0);
        if (this.bitLength() > v02) {
          this.subTo(BigInteger.ONE.shiftLeft(v02 - 1), this);
        }
      }
    }
  } else {
    /** @type {Array} */
    var a = new Array;
    /** @type {number} */
    var g = v02 & 7;
    /** @type {number} */
    a.length = (v02 >> 3) + 1;
    b.nextBytes(a);
    if (g > 0) {
      a[0] &= (1 << g) - 1;
    } else {
      /** @type {number} */
      a[0] = 0;
    }
    this.fromString(a, 256);
  }
}
/**
 * @return {?}
 */
function bnToByteArray() {
  var t = this.t;
  /** @type {Array} */
  var res = new Array;
  res[0] = this.s;
  /** @type {number} */
  var DB = this.DB - t * this.DB % 8;
  var key;
  /** @type {number} */
  var resLength = 0;
  if (t-- > 0) {
    if (DB < this.DB && (key = this[t] >> DB) != (this.s & this.DM) >> DB) {
      /** @type {number} */
      res[resLength++] = key | this.s << this.DB - DB;
    }
    for (;t >= 0;) {
      if (DB < 8) {
        /** @type {number} */
        key = (this[t] & (1 << DB) - 1) << 8 - DB;
        key |= this[--t] >> (DB += this.DB - 8);
      } else {
        /** @type {number} */
        key = this[t] >> (DB -= 8) & 255;
        if (DB <= 0) {
          DB += this.DB;
          --t;
        }
      }
      if ((key & 128) != 0) {
        key |= -256;
      }
      if (resLength == 0 && (this.s & 128) != (key & 128)) {
        ++resLength;
      }
      if (resLength > 0 || key != this.s) {
        /** @type {number} */
        res[resLength++] = key;
      }
    }
  }
  return res;
}
/**
 * @param {?} b
 * @return {?}
 */
function bnEquals(b) {
  return this.compareTo(b) == 0;
}
/**
 * @param {Object} b
 * @return {?}
 */
function bnMin(b) {
  return this.compareTo(b) < 0 ? this : b;
}
/**
 * @param {Object} b
 * @return {?}
 */
function bnMax(b) {
  return this.compareTo(b) > 0 ? this : b;
}
/**
 * @param {Object} t
 * @param {Function} callback
 * @param {?} r
 * @return {undefined}
 */
function bnpBitwiseTo(t, callback, r) {
  var i;
  var index;
  /** @type {number} */
  var lastLine = Math.min(t.t, this.t);
  /** @type {number} */
  i = 0;
  for (;i < lastLine;++i) {
    r[i] = callback(this[i], t[i]);
  }
  if (t.t < this.t) {
    /** @type {number} */
    index = t.s & this.DM;
    /** @type {number} */
    i = lastLine;
    for (;i < this.t;++i) {
      r[i] = callback(this[i], index);
    }
    r.t = this.t;
  } else {
    /** @type {number} */
    index = this.s & this.DM;
    /** @type {number} */
    i = lastLine;
    for (;i < t.t;++i) {
      r[i] = callback(index, t[i]);
    }
    r.t = t.t;
  }
  r.s = callback(this.s, t.s);
  r.clamp();
}
/**
 * @param {number} dataAndEvents
 * @param {number} deepDataAndEvents
 * @return {?}
 */
function op_and(dataAndEvents, deepDataAndEvents) {
  return dataAndEvents & deepDataAndEvents;
}
/**
 * @param {Object} sqlt
 * @return {?}
 */
function bnAnd(sqlt) {
  var newTime = nbi();
  this.bitwiseTo(sqlt, op_and, newTime);
  return newTime;
}
/**
 * @param {number} dataAndEvents
 * @param {number} deepDataAndEvents
 * @return {?}
 */
function op_or(dataAndEvents, deepDataAndEvents) {
  return dataAndEvents | deepDataAndEvents;
}
/**
 * @param {Object} sqlt
 * @return {?}
 */
function bnOr(sqlt) {
  var newTime = nbi();
  this.bitwiseTo(sqlt, op_or, newTime);
  return newTime;
}
/**
 * @param {number} dataAndEvents
 * @param {number} deepDataAndEvents
 * @return {?}
 */
function op_xor(dataAndEvents, deepDataAndEvents) {
  return dataAndEvents ^ deepDataAndEvents;
}
/**
 * @param {Object} sqlt
 * @return {?}
 */
function bnXor(sqlt) {
  var newTime = nbi();
  this.bitwiseTo(sqlt, op_xor, newTime);
  return newTime;
}
/**
 * @param {number} dataAndEvents
 * @param {?} deepDataAndEvents
 * @return {?}
 */
function op_andnot(dataAndEvents, deepDataAndEvents) {
  return dataAndEvents & ~deepDataAndEvents;
}
/**
 * @param {Object} sqlt
 * @return {?}
 */
function bnAndNot(sqlt) {
  var newTime = nbi();
  this.bitwiseTo(sqlt, op_andnot, newTime);
  return newTime;
}
/**
 * @return {?}
 */
function bnNot() {
  var t = nbi();
  /** @type {number} */
  var func = 0;
  for (;func < this.t;++func) {
    /** @type {number} */
    t[func] = this.DM & ~this[func];
  }
  t.t = this.t;
  /** @type {number} */
  t.s = ~this.s;
  return t;
}
/**
 * @param {number} m1
 * @return {?}
 */
function bnShiftLeft(m1) {
  var camelKey = nbi();
  if (m1 < 0) {
    this.rShiftTo(-m1, camelKey);
  } else {
    this.lShiftTo(m1, camelKey);
  }
  return camelKey;
}
/**
 * @param {number} dataAndEvents
 * @return {?}
 */
function bnShiftRight(dataAndEvents) {
  var camelKey = nbi();
  if (dataAndEvents < 0) {
    this.lShiftTo(-dataAndEvents, camelKey);
  } else {
    this.rShiftTo(dataAndEvents, camelKey);
  }
  return camelKey;
}
/**
 * @param {number} dataAndEvents
 * @return {?}
 */
function lbit(dataAndEvents) {
  if (dataAndEvents == 0) {
    return-1;
  }
  /** @type {number} */
  var lbit = 0;
  if ((dataAndEvents & 65535) == 0) {
    dataAndEvents >>= 16;
    lbit += 16;
  }
  if ((dataAndEvents & 255) == 0) {
    dataAndEvents >>= 8;
    lbit += 8;
  }
  if ((dataAndEvents & 15) == 0) {
    dataAndEvents >>= 4;
    lbit += 4;
  }
  if ((dataAndEvents & 3) == 0) {
    dataAndEvents >>= 2;
    lbit += 2;
  }
  if ((dataAndEvents & 1) == 0) {
    ++lbit;
  }
  return lbit;
}
/**
 * @return {?}
 */
function bnGetLowestSetBit() {
  /** @type {number} */
  var unlock = 0;
  for (;unlock < this.t;++unlock) {
    if (this[unlock] != 0) {
      return unlock * this.DB + lbit(this[unlock]);
    }
  }
  if (this.s < 0) {
    return this.t * this.DB;
  }
  return-1;
}
/**
 * @param {number} dataAndEvents
 * @return {?}
 */
function cbit(dataAndEvents) {
  /** @type {number} */
  var cbit = 0;
  for (;dataAndEvents != 0;) {
    dataAndEvents &= dataAndEvents - 1;
    ++cbit;
  }
  return cbit;
}
/**
 * @return {?}
 */
function bnBitCount() {
  /** @type {number} */
  var bnBitCount = 0;
  /** @type {number} */
  var number = this.s & this.DM;
  /** @type {number} */
  var regTo = 0;
  for (;regTo < this.t;++regTo) {
    bnBitCount += cbit(this[regTo] ^ number);
  }
  return bnBitCount;
}
/**
 * @param {?} m1
 * @return {?}
 */
function bnTestBit(m1) {
  /** @type {number} */
  var f = Math.floor(m1 / this.DB);
  if (f >= this.t) {
    return this.s != 0;
  }
  return(this[f] & 1 << m1 % this.DB) != 0;
}
/**
 * @param {number} m1
 * @param {Function} next_callback
 * @return {?}
 */
function bnpChangeBit(m1, next_callback) {
  var j = BigInteger.ONE.shiftLeft(m1);
  this.bitwiseTo(j, next_callback, j);
  return j;
}
/**
 * @param {number} m1
 * @return {?}
 */
function bnSetBit(m1) {
  return this.changeBit(m1, op_or);
}
/**
 * @param {number} m1
 * @return {?}
 */
function bnClearBit(m1) {
  return this.changeBit(m1, op_andnot);
}
/**
 * @param {number} m1
 * @return {?}
 */
function bnFlipBit(m1) {
  return this.changeBit(m1, op_xor);
}
/**
 * @param {Object} o
 * @param {(Array|Int8Array|Uint8Array)} key
 * @return {undefined}
 */
function bnpAddTo(o, key) {
  /** @type {number} */
  var x = 0;
  /** @type {number} */
  var s = 0;
  /** @type {number} */
  var y = Math.min(o.t, this.t);
  for (;x < y;) {
    s += this[x] + o[x];
    /** @type {number} */
    key[x++] = s & this.DM;
    s >>= this.DB;
  }
  if (o.t < this.t) {
    s += o.s;
    for (;x < this.t;) {
      s += this[x];
      /** @type {number} */
      key[x++] = s & this.DM;
      s >>= this.DB;
    }
    s += this.s;
  } else {
    s += this.s;
    for (;x < o.t;) {
      s += o[x];
      /** @type {number} */
      key[x++] = s & this.DM;
      s >>= this.DB;
    }
    s += o.s;
  }
  /** @type {number} */
  key.s = s < 0 ? -1 : 0;
  if (s > 0) {
    key[x++] = s;
  } else {
    if (s < -1) {
      key[x++] = this.DV + s;
    }
  }
  /** @type {number} */
  key.t = x;
  key.clamp();
}
/**
 * @param {?} o
 * @return {?}
 */
function bnAdd(o) {
  var camelKey = nbi();
  this.addTo(o, camelKey);
  return camelKey;
}
/**
 * @param {?} thisObj
 * @return {?}
 */
function bnSubtract(thisObj) {
  var camelKey = nbi();
  this.subTo(thisObj, camelKey);
  return camelKey;
}
/**
 * @param {Node} isXML
 * @return {?}
 */
function bnMultiply(isXML) {
  var ll = nbi();
  this.multiplyTo(isXML, ll);
  return ll;
}
/**
 * @param {Object} isXML
 * @return {?}
 */
function bnDivide(isXML) {
  var recurring = nbi();
  this.divRemTo(isXML, recurring, null);
  return recurring;
}
/**
 * @param {Object} isXML
 * @return {?}
 */
function bnRemainder(isXML) {
  var QUnit = nbi();
  this.divRemTo(isXML, null, QUnit);
  return QUnit;
}
/**
 * @param {Object} isXML
 * @return {?}
 */
function bnDivideAndRemainder(isXML) {
  var recurring = nbi();
  var parent = nbi();
  this.divRemTo(isXML, recurring, parent);
  return new Array(recurring, parent);
}
/**
 * @param {number} v00
 * @return {undefined}
 */
function bnpDMultiply(v00) {
  this[this.t] = this.am(0, v00 - 1, this, 0, 0, this.t);
  ++this.t;
  this.clamp();
}
/**
 * @param {number} expectedNumberOfNonCommentArgs
 * @param {number} mayParseLabeledStatementInstead
 * @return {undefined}
 */
function bnpDAddOffset(expectedNumberOfNonCommentArgs, mayParseLabeledStatementInstead) {
  for (;this.t <= mayParseLabeledStatementInstead;) {
    /** @type {number} */
    this[this.t++] = 0;
  }
  this[mayParseLabeledStatementInstead] += expectedNumberOfNonCommentArgs;
  for (;this[mayParseLabeledStatementInstead] >= this.DV;) {
    this[mayParseLabeledStatementInstead] -= this.DV;
    if (++mayParseLabeledStatementInstead >= this.t) {
      /** @type {number} */
      this[this.t++] = 0;
    }
    ++this[mayParseLabeledStatementInstead];
  }
}
/**
 * @return {undefined}
 */
function NullExp() {
}
/**
 * @param {?} x
 * @return {?}
 */
function nNop(x) {
  return x;
}
/**
 * @param {?} coordinates
 * @param {Node} result
 * @param {Object} x
 * @return {undefined}
 */
function nMulTo(coordinates, result, x) {
  coordinates.multiplyTo(result, x);
}
/**
 * @param {?} x
 * @param {?} ll
 * @return {undefined}
 */
function nSqrTo(x, ll) {
  x.squareTo(ll);
}
/** @type {function (?): ?} */
NullExp.prototype.convert = nNop;
/** @type {function (?): ?} */
NullExp.prototype.revert = nNop;
/** @type {function (?, Node, Object): undefined} */
NullExp.prototype.mulTo = nMulTo;
/** @type {function (?, ?): undefined} */
NullExp.prototype.sqrTo = nSqrTo;
/**
 * @param {number} node
 * @return {?}
 */
function bnPow(node) {
  return this.exp(node, new NullExp);
}
/**
 * @param {Object} message
 * @param {number} steps
 * @param {Object} o
 * @return {undefined}
 */
function bnpMultiplyLowerTo(message, steps, o) {
  /** @type {number} */
  var i = Math.min(this.t + message.t, steps);
  /** @type {number} */
  o.s = 0;
  /** @type {number} */
  o.t = i;
  for (;i > 0;) {
    /** @type {number} */
    o[--i] = 0;
  }
  var padLength;
  /** @type {number} */
  padLength = o.t - this.t;
  for (;i < padLength;++i) {
    o[i + this.t] = this.am(0, message[i], o, i, 0, this.t);
  }
  /** @type {number} */
  padLength = Math.min(message.t, steps);
  for (;i < padLength;++i) {
    this.am(0, message[i], o, i, 0, steps - i);
  }
  o.clamp();
}
/**
 * @param {Object} f
 * @param {?} t
 * @param {Object} b
 * @return {undefined}
 */
function bnpMultiplyUpperTo(f, t, b) {
  --t;
  /** @type {number} */
  var d = b.t = this.t + f.t - t;
  /** @type {number} */
  b.s = 0;
  for (;--d >= 0;) {
    /** @type {number} */
    b[d] = 0;
  }
  /** @type {number} */
  d = Math.max(t - this.t, 0);
  for (;d < f.t;++d) {
    b[this.t + d - t] = this.am(t - d, f[d], b, 0, 0, this.t + d - t);
  }
  b.clamp();
  b.drShiftTo(1, b);
}
/**
 * @param {Object} isXML
 * @return {undefined}
 */
function Barrett(isXML) {
  this.r2 = nbi();
  this.q3 = nbi();
  BigInteger.ONE.dlShiftTo(2 * isXML.t, this.r2);
  this.mu = this.r2.divide(isXML);
  /** @type {Object} */
  this.m = isXML;
}
/**
 * @param {Object} x
 * @return {?}
 */
function barrettConvert(x) {
  if (x.s < 0 || x.t > 2 * this.m.t) {
    return x.mod(this.m);
  } else {
    if (x.compareTo(this.m) < 0) {
      return x;
    } else {
      var ll = nbi();
      x.copyTo(ll);
      this.reduce(ll);
      return ll;
    }
  }
}
/**
 * @param {?} x
 * @return {?}
 */
function barrettRevert(x) {
  return x;
}
/**
 * @param {Object} x
 * @return {undefined}
 */
function barrettReduce(x) {
  x.drShiftTo(this.m.t - 1, this.r2);
  if (x.t > this.m.t + 1) {
    x.t = this.m.t + 1;
    x.clamp();
  }
  this.mu.multiplyUpperTo(this.r2, this.m.t + 1, this.q3);
  this.m.multiplyLowerTo(this.q3, this.m.t + 1, this.r2);
  for (;x.compareTo(this.r2) < 0;) {
    x.dAddOffset(1, this.m.t + 1);
  }
  x.subTo(this.r2, x);
  for (;x.compareTo(this.m) >= 0;) {
    x.subTo(this.m, x);
  }
}
/**
 * @param {?} x
 * @param {Object} ll
 * @return {undefined}
 */
function barrettSqrTo(x, ll) {
  x.squareTo(ll);
  this.reduce(ll);
}
/**
 * @param {?} coordinates
 * @param {Node} result
 * @param {Object} ll
 * @return {undefined}
 */
function barrettMulTo(coordinates, result, ll) {
  coordinates.multiplyTo(result, ll);
  this.reduce(ll);
}
/** @type {function (Object): ?} */
Barrett.prototype.convert = barrettConvert;
/** @type {function (?): ?} */
Barrett.prototype.revert = barrettRevert;
/** @type {function (Object): undefined} */
Barrett.prototype.reduce = barrettReduce;
/** @type {function (?, Node, Object): undefined} */
Barrett.prototype.mulTo = barrettMulTo;
/** @type {function (?, Object): undefined} */
Barrett.prototype.sqrTo = barrettSqrTo;
/**
 * @param {Object} args
 * @param {?} dataAndEvents
 * @return {?}
 */
function bnModPow(args, dataAndEvents) {
  var a = args.bitLength();
  var d;
  var ll = nbv(1);
  var util;
  if (a <= 0) {
    return ll;
  } else {
    if (a < 18) {
      /** @type {number} */
      d = 1;
    } else {
      if (a < 48) {
        /** @type {number} */
        d = 3;
      } else {
        if (a < 144) {
          /** @type {number} */
          d = 4;
        } else {
          if (a < 768) {
            /** @type {number} */
            d = 5;
          } else {
            /** @type {number} */
            d = 6;
          }
        }
      }
    }
  }
  if (a < 8) {
    util = new Classic(dataAndEvents);
  } else {
    if (dataAndEvents.isEven()) {
      util = new Barrett(dataAndEvents);
    } else {
      util = new Montgomery(dataAndEvents);
    }
  }
  /** @type {Array} */
  var points = new Array;
  /** @type {number} */
  var i = 3;
  /** @type {number} */
  var b = d - 1;
  /** @type {number} */
  var maxRange = (1 << d) - 1;
  points[1] = util.convert(this);
  if (d > 1) {
    var value = nbi();
    util.sqrTo(points[1], value);
    for (;i <= maxRange;) {
      points[i] = nbi();
      util.mulTo(value, points[i - 2], points[i]);
      i += 2;
    }
  }
  /** @type {number} */
  var end = args.t - 1;
  var idx;
  /** @type {boolean} */
  var u = true;
  var coordinates = nbi();
  var coords;
  /** @type {number} */
  a = nbits(args[end]) - 1;
  for (;end >= 0;) {
    if (a >= b) {
      /** @type {number} */
      idx = args[end] >> a - b & maxRange;
    } else {
      /** @type {number} */
      idx = (args[end] & (1 << a + 1) - 1) << b - a;
      if (end > 0) {
        idx |= args[end - 1] >> this.DB + a - b;
      }
    }
    /** @type {number} */
    i = d;
    for (;(idx & 1) == 0;) {
      idx >>= 1;
      --i;
    }
    if ((a -= i) < 0) {
      a += this.DB;
      --end;
    }
    if (u) {
      points[idx].copyTo(ll);
      /** @type {boolean} */
      u = false;
    } else {
      for (;i > 1;) {
        util.sqrTo(ll, coordinates);
        util.sqrTo(coordinates, ll);
        i -= 2;
      }
      if (i > 0) {
        util.sqrTo(ll, coordinates);
      } else {
        coords = ll;
        ll = coordinates;
        coordinates = coords;
      }
      util.mulTo(coordinates, points[idx], ll);
    }
    for (;end >= 0 && (args[end] & 1 << a) == 0;) {
      util.sqrTo(ll, coordinates);
      coords = ll;
      ll = coordinates;
      coordinates = coords;
      if (--a < 0) {
        /** @type {number} */
        a = this.DB - 1;
        --end;
      }
    }
  }
  return util.revert(ll);
}
/**
 * @param {Date} clone
 * @return {?}
 */
function bnGCD(clone) {
  var parent = this.s < 0 ? this.negate() : this.clone();
  var node = clone.s < 0 ? clone.negate() : clone.clone();
  if (parent.compareTo(node) < 0) {
    var fragment = parent;
    parent = node;
    node = fragment;
  }
  var child = parent.getLowestSetBit();
  var m = node.getLowestSetBit();
  if (m < 0) {
    return parent;
  }
  if (child < m) {
    m = child;
  }
  if (m > 0) {
    parent.rShiftTo(m, parent);
    node.rShiftTo(m, node);
  }
  for (;parent.signum() > 0;) {
    if ((child = parent.getLowestSetBit()) > 0) {
      parent.rShiftTo(child, parent);
    }
    if ((child = node.getLowestSetBit()) > 0) {
      node.rShiftTo(child, node);
    }
    if (parent.compareTo(node) >= 0) {
      parent.subTo(node, parent);
      parent.rShiftTo(1, parent);
    } else {
      node.subTo(parent, node);
      node.rShiftTo(1, node);
    }
  }
  if (m > 0) {
    node.lShiftTo(m, node);
  }
  return node;
}
/**
 * @param {number} dataAndEvents
 * @return {?}
 */
function bnpModInt(dataAndEvents) {
  if (dataAndEvents <= 0) {
    return 0;
  }
  /** @type {number} */
  var a1 = this.DV % dataAndEvents;
  /** @type {number} */
  var b4 = this.s < 0 ? dataAndEvents - 1 : 0;
  if (this.t > 0) {
    if (a1 == 0) {
      /** @type {number} */
      b4 = this[0] % dataAndEvents;
    } else {
      /** @type {number} */
      var unlock = this.t - 1;
      for (;unlock >= 0;--unlock) {
        /** @type {number} */
        b4 = (a1 * b4 + this[unlock]) % dataAndEvents;
      }
    }
  }
  return b4;
}
/**
 * @param {?} b
 * @return {?}
 */
function bnModInverse(b) {
  var j = b.isEven();
  if (this.isEven() && j || b.signum() == 0) {
    return BigInteger.ZERO;
  }
  var node = b.clone();
  var a = this.clone();
  var second = nbv(1);
  var self = nbv(0);
  var first = nbv(0);
  var target = nbv(1);
  for (;node.signum() != 0;) {
    for (;node.isEven();) {
      node.rShiftTo(1, node);
      if (j) {
        if (!second.isEven() || !self.isEven()) {
          second.addTo(this, second);
          self.subTo(b, self);
        }
        second.rShiftTo(1, second);
      } else {
        if (!self.isEven()) {
          self.subTo(b, self);
        }
      }
      self.rShiftTo(1, self);
    }
    for (;a.isEven();) {
      a.rShiftTo(1, a);
      if (j) {
        if (!first.isEven() || !target.isEven()) {
          first.addTo(this, first);
          target.subTo(b, target);
        }
        first.rShiftTo(1, first);
      } else {
        if (!target.isEven()) {
          target.subTo(b, target);
        }
      }
      target.rShiftTo(1, target);
    }
    if (node.compareTo(a) >= 0) {
      node.subTo(a, node);
      if (j) {
        second.subTo(first, second);
      }
      self.subTo(target, self);
    } else {
      a.subTo(node, a);
      if (j) {
        first.subTo(second, first);
      }
      target.subTo(self, target);
    }
  }
  if (a.compareTo(BigInteger.ONE) != 0) {
    return BigInteger.ZERO;
  }
  if (target.compareTo(b) >= 0) {
    return target.subtract(b);
  }
  if (target.signum() < 0) {
    target.addTo(b, target);
  } else {
    return target;
  }
  if (target.signum() < 0) {
    return target.add(b);
  } else {
    return target;
  }
}
/** @type {Array} */
var lowprimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509];
/** @type {number} */
var lplim = (1 << 26) / lowprimes[lowprimes.length - 1];
/**
 * @param {number} symbol
 * @return {?}
 */
function bnIsProbablePrime(symbol) {
  var i;
  var a = this.abs();
  if (a.t == 1 && a[0] <= lowprimes[lowprimes.length - 1]) {
    /** @type {number} */
    i = 0;
    for (;i < lowprimes.length;++i) {
      if (a[0] == lowprimes[i]) {
        return true;
      }
    }
    return false;
  }
  if (a.isEven()) {
    return false;
  }
  /** @type {number} */
  i = 1;
  for (;i < lowprimes.length;) {
    var node = lowprimes[i];
    /** @type {number} */
    var j = i + 1;
    for (;j < lowprimes.length && node < lplim;) {
      node *= lowprimes[j++];
    }
    node = a.modInt(node);
    for (;i < j;) {
      if (node % lowprimes[i++] == 0) {
        return false;
      }
    }
  }
  return a.millerRabin(symbol);
}
/**
 * @param {number} n
 * @return {?}
 */
function bnpMillerRabin(n) {
  var end = this.subtract(BigInteger.ONE);
  var dataAndEvents = end.getLowestSetBit();
  if (dataAndEvents <= 0) {
    return false;
  }
  var arg = end.shiftRight(dataAndEvents);
  /** @type {number} */
  n = n + 1 >> 1;
  if (n > lowprimes.length) {
    n = lowprimes.length;
  }
  var jQuery = nbi();
  /** @type {number} */
  var i = 0;
  for (;i < n;++i) {
    jQuery.fromInt(lowprimes[i]);
    var type = jQuery.modPow(arg, this);
    if (type.compareTo(BigInteger.ONE) != 0 && type.compareTo(end) != 0) {
      /** @type {number} */
      var d = 1;
      for (;d++ < dataAndEvents && type.compareTo(end) != 0;) {
        type = type.modPowInt(2, this);
        if (type.compareTo(BigInteger.ONE) == 0) {
          return false;
        }
      }
      if (type.compareTo(end) != 0) {
        return false;
      }
    }
  }
  return true;
}
/** @type {function (number): ?} */
BigInteger.prototype.chunkSize = bnpChunkSize;
/** @type {function (number): ?} */
BigInteger.prototype.toRadix = bnpToRadix;
/** @type {function (string, number): undefined} */
BigInteger.prototype.fromRadix = bnpFromRadix;
/** @type {function (number, number, number): undefined} */
BigInteger.prototype.fromNumber = bnpFromNumber;
/** @type {function (Object, Function, ?): undefined} */
BigInteger.prototype.bitwiseTo = bnpBitwiseTo;
/** @type {function (number, Function): ?} */
BigInteger.prototype.changeBit = bnpChangeBit;
/** @type {function (Object, (Array|Int8Array|Uint8Array)): undefined} */
BigInteger.prototype.addTo = bnpAddTo;
/** @type {function (number): undefined} */
BigInteger.prototype.dMultiply = bnpDMultiply;
/** @type {function (number, number): undefined} */
BigInteger.prototype.dAddOffset = bnpDAddOffset;
/** @type {function (Object, number, Object): undefined} */
BigInteger.prototype.multiplyLowerTo = bnpMultiplyLowerTo;
/** @type {function (Object, ?, Object): undefined} */
BigInteger.prototype.multiplyUpperTo = bnpMultiplyUpperTo;
/** @type {function (number): ?} */
BigInteger.prototype.modInt = bnpModInt;
/** @type {function (number): ?} */
BigInteger.prototype.millerRabin = bnpMillerRabin;
/** @type {function (): ?} */
BigInteger.prototype.clone = bnClone;
/** @type {function (): ?} */
BigInteger.prototype.intValue = bnIntValue;
/** @type {function (): ?} */
BigInteger.prototype.byteValue = bnByteValue;
/** @type {function (): ?} */
BigInteger.prototype.shortValue = bnShortValue;
/** @type {function (): ?} */
BigInteger.prototype.signum = bnSigNum;
/** @type {function (): ?} */
BigInteger.prototype.toByteArray = bnToByteArray;
/** @type {function (?): ?} */
BigInteger.prototype.equals = bnEquals;
/** @type {function (Object): ?} */
BigInteger.prototype.min = bnMin;
/** @type {function (Object): ?} */
BigInteger.prototype.max = bnMax;
/** @type {function (Object): ?} */
BigInteger.prototype.and = bnAnd;
/** @type {function (Object): ?} */
BigInteger.prototype.or = bnOr;
/** @type {function (Object): ?} */
BigInteger.prototype.xor = bnXor;
/** @type {function (Object): ?} */
BigInteger.prototype.andNot = bnAndNot;
/** @type {function (): ?} */
BigInteger.prototype.not = bnNot;
/** @type {function (number): ?} */
BigInteger.prototype.shiftLeft = bnShiftLeft;
/** @type {function (number): ?} */
BigInteger.prototype.shiftRight = bnShiftRight;
/** @type {function (): ?} */
BigInteger.prototype.getLowestSetBit = bnGetLowestSetBit;
/** @type {function (): ?} */
BigInteger.prototype.bitCount = bnBitCount;
/** @type {function (?): ?} */
BigInteger.prototype.testBit = bnTestBit;
/** @type {function (number): ?} */
BigInteger.prototype.setBit = bnSetBit;
/** @type {function (number): ?} */
BigInteger.prototype.clearBit = bnClearBit;
/** @type {function (number): ?} */
BigInteger.prototype.flipBit = bnFlipBit;
/** @type {function (?): ?} */
BigInteger.prototype.add = bnAdd;
/** @type {function (?): ?} */
BigInteger.prototype.subtract = bnSubtract;
/** @type {function (Node): ?} */
BigInteger.prototype.multiply = bnMultiply;
/** @type {function (Object): ?} */
BigInteger.prototype.divide = bnDivide;
/** @type {function (Object): ?} */
BigInteger.prototype.remainder = bnRemainder;
/** @type {function (Object): ?} */
BigInteger.prototype.divideAndRemainder = bnDivideAndRemainder;
/** @type {function (Object, ?): ?} */
BigInteger.prototype.modPow = bnModPow;
/** @type {function (?): ?} */
BigInteger.prototype.modInverse = bnModInverse;
/** @type {function (number): ?} */
BigInteger.prototype.pow = bnPow;
/** @type {function (Date): ?} */
BigInteger.prototype.gcd = bnGCD;
/** @type {function (number): ?} */
BigInteger.prototype.isProbablePrime = bnIsProbablePrime;
/**
 * @return {undefined}
 */
function Arcfour() {
  /** @type {number} */
  this.i = 0;
  /** @type {number} */
  this.j = 0;
  /** @type {Array} */
  this.S = new Array;
}
/**
 * @param {(Array|number)} texts
 * @return {undefined}
 */
function ARC4init(texts) {
  var i;
  var j;
  var tempi;
  /** @type {number} */
  i = 0;
  for (;i < 256;++i) {
    /** @type {number} */
    this.S[i] = i;
  }
  /** @type {number} */
  j = 0;
  /** @type {number} */
  i = 0;
  for (;i < 256;++i) {
    /** @type {number} */
    j = j + this.S[i] + texts[i % texts.length] & 255;
    tempi = this.S[i];
    this.S[i] = this.S[j];
    this.S[j] = tempi;
  }
  /** @type {number} */
  this.i = 0;
  /** @type {number} */
  this.j = 0;
}
/**
 * @return {?}
 */
function ARC4next() {
  var opcode;
  /** @type {number} */
  this.i = this.i + 1 & 255;
  /** @type {number} */
  this.j = this.j + this.S[this.i] & 255;
  opcode = this.S[this.i];
  this.S[this.i] = this.S[this.j];
  this.S[this.j] = opcode;
  return this.S[opcode + this.S[this.i] & 255];
}
/** @type {function ((Array|number)): undefined} */
Arcfour.prototype.init = ARC4init;
/** @type {function (): ?} */
Arcfour.prototype.next = ARC4next;
/**
 * @return {?}
 */
function prng_newstate() {
  return new Arcfour;
}
/** @type {number} */
var rng_psize = 256;
/**
 * @return {undefined}
 */
function SecureRandom() {
  this.rng_state;
  this.rng_pool;
  this.rng_pptr;
  /**
   * @param {number} deepDataAndEvents
   * @return {undefined}
   */
  this.rng_seed_int = function(deepDataAndEvents) {
    this.rng_pool[this.rng_pptr++] ^= deepDataAndEvents & 255;
    this.rng_pool[this.rng_pptr++] ^= deepDataAndEvents >> 8 & 255;
    this.rng_pool[this.rng_pptr++] ^= deepDataAndEvents >> 16 & 255;
    this.rng_pool[this.rng_pptr++] ^= deepDataAndEvents >> 24 & 255;
    if (this.rng_pptr >= rng_psize) {
      this.rng_pptr -= rng_psize;
    }
  };
  /**
   * @return {undefined}
   */
  this.rng_seed_time = function() {
    this.rng_seed_int((new Date).getTime());
  };
  if (this.rng_pool == null) {
    /** @type {Array} */
    this.rng_pool = new Array;
    /** @type {number} */
    this.rng_pptr = 0;
    var bi;
    if (navigator.appName == "Netscape" && (navigator.appVersion < "5" && window.crypto)) {
      var b = window.crypto.random(32);
      /** @type {number} */
      bi = 0;
      for (;bi < b.length;++bi) {
        /** @type {number} */
        this.rng_pool[this.rng_pptr++] = b.charCodeAt(bi) & 255;
      }
    }
    for (;this.rng_pptr < rng_psize;) {
      /** @type {number} */
      bi = Math.floor(65536 * Math.random());
      /** @type {number} */
      this.rng_pool[this.rng_pptr++] = bi >>> 8;
      /** @type {number} */
      this.rng_pool[this.rng_pptr++] = bi & 255;
    }
    /** @type {number} */
    this.rng_pptr = 0;
    this.rng_seed_time();
  }
  /**
   * @return {?}
   */
  this.rng_get_byte = function() {
    if (this.rng_state == null) {
      this.rng_seed_time();
      this.rng_state = prng_newstate();
      this.rng_state.init(this.rng_pool);
      /** @type {number} */
      this.rng_pptr = 0;
      for (;this.rng_pptr < this.rng_pool.length;++this.rng_pptr) {
        /** @type {number} */
        this.rng_pool[this.rng_pptr] = 0;
      }
      /** @type {number} */
      this.rng_pptr = 0;
    }
    return this.rng_state.next();
  };
  /**
   * @param {Array} b
   * @return {undefined}
   */
  this.nextBytes = function(b) {
    var bi;
    /** @type {number} */
    bi = 0;
    for (;bi < b.length;++bi) {
      b[bi] = this.rng_get_byte();
    }
  };
}
;
