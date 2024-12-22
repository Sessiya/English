function compressNumber(int)
{
	return base32().decode(int.toString(32));
};

function decompressNumber(str)
{
	return parseInt(base32().encode(str, true), 32);
};

function base32()
{
	/**
	 * Generate a character map.
	 * @param {string} alphabet e.g. "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
	 * @param {object} mappings map overrides from key to value
	 * @method
	 */

	var charmap = function (alphabet, mappings) {
	  mappings || (mappings = {});
	  alphabet.split("").forEach(function (c, i) {
		if (!(c in mappings)) mappings[c] = i;
	  });
	  return mappings;
	}

	/**
	 * The RFC 4648 base 32 alphabet and character map.
	 * @see {@link https://tools.ietf.org/html/rfc4648}
	 */

	var rfc4648 = {
	  alphabet: "0123456789abcdefghijklmnopqrstuv",
	  charmap: {
	  }
	};

	rfc4648.charmap = charmap(rfc4648.alphabet, rfc4648.charmap);

	/**
	 * The Crockford base 32 alphabet and character map.
	 * @see {@link http://www.crockford.com/wrmg/base32.html}
	 */

	var crockford = {
	  alphabet: "0123456789abcdefghijklmnopqrstuv",
	  charmap: {
	  }
	};

	crockford.charmap = charmap(crockford.alphabet, crockford.charmap);

	/**
	 * base32hex
	 * @see {@link https://en.wikipedia.org/wiki/Base32#base32hex}
	 */

	var base32hex = {
	  alphabet: "0123456789abcdefghijklmnopqrstuv",
	  charmap: {}
	};

	base32hex.charmap = charmap(base32hex.alphabet, base32hex.charmap);

	/**
	 * Create a new `Decoder` with the given options.
	 *
	 * @param {object} [options]
	 *   @param {string} [type] Supported Base-32 variants are "rfc4648" and
	 *     "crockford".
	 *   @param {object} [charmap] Override the character map used in decoding.
	 * @constructor
	 */

	function Decoder (options) {
	  this.buf = [];
	  this.shift = 8;
	  this.carry = 0;

	  if (options) {

		switch (options.type) {
		  case "rfc4648":
			this.charmap = exports.rfc4648.charmap;
			break;
		  case "crockford":
			this.charmap = exports.crockford.charmap;
			break;
		  case "base32hex":
			this.charmap = exports.base32hex.charmap;
			break;
		  default:
			throw new Error("invalid type");
		}

		if (options.charmap) this.charmap = options.charmap;
	  }
	}

	/**
	 * The default character map coresponds to RFC4648.
	 */

	Decoder.prototype.charmap = rfc4648.charmap;

	/**
	 * Decode a string, continuing from the previous state.
	 *
	 * @param {string} str
	 * @return {Decoder} this
	 */

	Decoder.prototype.write = function (str) {
	  var charmap = this.charmap;
	  var buf = this.buf;
	  var shift = this.shift;
	  var carry = this.carry;

	  // decode string
	  str.split("").forEach(function (char) {

		// ignore padding
		if (char == "=") return;

		// lookup symbol
		var symbol = charmap[char] & 0xff;

		// 1: 00000 000
		// 2:          00 00000 0
		// 3:                    0000 0000
		// 4:                             0 00000 00
		// 5:                                       000 00000
		// 6:                                                00000 000
		// 7:                                                         00 00000 0

		shift -= 5;
		if (shift > 0) {
		  carry |= symbol << shift;
		} else if (shift < 0) {
		  buf.push(carry | (symbol >> -shift));
		  shift += 8;
		  carry = (symbol << shift) & 0xff;
		} else {
		  buf.push(carry | symbol);
		  shift = 8;
		  carry = 0;
		}
	  });

	  // save state
	  this.shift = shift;
	  this.carry = carry;

	  // for chaining
	  return this;
	};

	/**
	 * Finish decoding.
	 *
	 * @param {string} [str] The final string to decode.
	 * @return {Array} Decoded byte array.
	 */

	Decoder.prototype.finalize = function (str) {
	  if (str) {
		this.write(str);
	  }
	  if (this.shift !== 8 && this.carry !== 0) {
		this.buf.push(this.carry);
		this.shift = 8;
		this.carry = 0;
	  }
	  return this.buf;
	};

	/**
	 * Create a new `Encoder` with the given options.
	 *
	 * @param {object} [options]
	 *   @param {string} [type] Supported Base-32 variants are "rfc4648" and
	 *     "crockford".
	 *   @param {object} [alphabet] Override the alphabet used in encoding.
	 * @constructor
	 */

	function Encoder (options) {
	  this.buf = "";
	  this.shift = 3;
	  this.carry = 0;

	  if (options) {

		switch (options.type) {
		  case "rfc4648":
			this.alphabet = exports.rfc4648.alphabet;
			break;
		  case "crockford":
			this.alphabet = exports.crockford.alphabet;
			break;
		  case "base32hex":
			this.alphabet = exports.base32hex.alphabet;
			break;
		  default:
			throw new Error("invalid type");
		}

		if (options.alphabet) this.alphabet = options.alphabet;
		else if (options.lc) this.alphabet = this.alphabet.toLowerCase();
	  }
	}

	/**
	 * The default alphabet coresponds to RFC4648.
	 */

	Encoder.prototype.alphabet = rfc4648.alphabet;

	/**
	 * Encode a byte array, continuing from the previous state.
	 *
	 * @param {byte[]} buf The byte array to encode.
	 * @return {Encoder} this
	 */

	Encoder.prototype.write = function (buf) {
	  var shift = this.shift;
	  var carry = this.carry;
	  var symbol;
	  var byte;
	  var i;

	  // encode each byte in buf
	  for (i = 0; i < buf.length; i++) {
		byte = buf[i];

		// 1: 00000 000
		// 2:          00 00000 0
		// 3:                    0000 0000
		// 4:                             0 00000 00
		// 5:                                       000 00000
		// 6:                                                00000 000
		// 7:                                                         00 00000 0

		symbol = carry | (byte >> shift);
		this.buf += this.alphabet[symbol & 0x1f];

		if (shift > 5) {
		  shift -= 5;
		  symbol = byte >> shift;
		  this.buf += this.alphabet[symbol & 0x1f];
		}

		shift = 5 - shift;
		carry = byte << shift;
		shift = 8 - shift;
	  }

	  // save state
	  this.shift = shift;
	  this.carry = carry;

	  // for chaining
	  return this;
	};

	/**
	 * Finish encoding.
	 *
	 * @param {byte[]} [buf] The final byte array to encode.
	 * @return {string} The encoded byte array.
	 */

	Encoder.prototype.finalize = function (buf) {
	  if (buf) {
		this.write(buf);
	  }
	  if (this.shift !== 3) {
		this.buf += this.alphabet[this.carry & 0x1f];
		this.shift = 3;
		this.carry = 0;
	  }
	  return this.buf;
	};

		return {
			encode: function (str, leaveZero) {

				var bytes = [];
				for (var k = 0; k < str.length; k++)
				{
					bytes.push(str.charCodeAt(k));
				}

				var res = new Encoder().finalize(bytes);

				if (!leaveZero)
				{
					// 5h6o3nomu0
					while (res[res.length - 1] == '0')
					{
						res = res.substr(0, res.length - 1);
						if (this.decode(res) != str)
						{
							res = res + '0';
							break;
						}
					}
				}

				return res;
			},

			decode: function (str, options) {
				return String.fromCharCode.apply(null, new Decoder(options).finalize(str));
				}
		}
}

/*
 * [hi-base32]{@link https://github.com/emn178/hi-base32}
 *
 * @version 0.3.0
 * @author Chen, Yi-Cyuan [emn178@gmail.com]
 * @copyright Chen, Yi-Cyuan 2015-2017
 * @license MIT
 */
/*jslint bitwise: true */
function xbase32()
{
  var BASE32_ENCODE_CHAR = '0123456789abcdefghijklmnopqrstuv'.split('');
  var BASE32_DECODE_CHAR = {
    '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
    '9': 9, 'a': 10, 'b': 11, 'c': 12, 'd': 13, 'e': 14, 'f': 15, 'g': 16,
    'h': 17, 'i': 18, 'j': 19, 'k': 20, 'l': 21, 'm': 22, 'n': 23, 'o': 24,
    'p': 25, 'q': 26, 'r': 27, 's': 28, 't': 29, 'u': 30, 'v': 31
  };

  var blocks = [0, 0, 0, 0, 0, 0, 0, 0];

  var decodeAsBytes = function (base32Str) {
    base32Str = base32Str.replace(/=/g, '');
    var v1, v2, v3, v4, v5, v6, v7, v8, bytes = [], index = 0, length = base32Str.length;

    // 4 char to 3 bytes
    for (var i = 0, count = length >> 3 << 3; i < count;) {
      v1 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v2 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v3 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v4 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v5 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v6 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v7 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v8 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      bytes[index++] = (v1 << 3 | v2 >>> 2) & 255;
      bytes[index++] = (v2 << 6 | v3 << 1 | v4 >>> 4) & 255;
      bytes[index++] = (v4 << 4 | v5 >>> 1) & 255;
      bytes[index++] = (v5 << 7 | v6 << 2 | v7 >>> 3) & 255;
      bytes[index++] = (v7 << 5 | v8) & 255;
    }

    // remain bytes
    var remain = length - count;
    if (remain === 2) {
      v1 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v2 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      bytes[index++] = (v1 << 3 | v2 >>> 2) & 255;
    } else if (remain === 4) {
      v1 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v2 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v3 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v4 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      bytes[index++] = (v1 << 3 | v2 >>> 2) & 255;
      bytes[index++] = (v2 << 6 | v3 << 1 | v4 >>> 4) & 255;
    } else if (remain === 5) {
      v1 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v2 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v3 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v4 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v5 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      bytes[index++] = (v1 << 3 | v2 >>> 2) & 255;
      bytes[index++] = (v2 << 6 | v3 << 1 | v4 >>> 4) & 255;
      bytes[index++] = (v4 << 4 | v5 >>> 1) & 255;
    } else if (remain === 7) {
      v1 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v2 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v3 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v4 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v5 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v6 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v7 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      bytes[index++] = (v1 << 3 | v2 >>> 2) & 255;
      bytes[index++] = (v2 << 6 | v3 << 1 | v4 >>> 4) & 255;
      bytes[index++] = (v4 << 4 | v5 >>> 1) & 255;
      bytes[index++] = (v5 << 7 | v6 << 2 | v7 >>> 3) & 255;
    }
    return bytes;
  };

  var encodeBinary = function(str)
  {
	var bytes = [];
	for (var k = 0; k < str.length; k++)
	{
		bytes.push(str.charCodeAt(k));
	}

	var output = encodeBytes(bytes);

	//~ while (output[output.length - 1] == '=')
	//~ {
		//~ output = output.substr(0, output.length - 1);
	//~ }

	return output;
  };

  var encodeAscii = function (str) {
    var v1, v2, v3, v4, v5, base32Str = '', length = str.length;
    for (var i = 0, count = parseInt(length / 5) * 5; i < count;) {
      v1 = str.charCodeAt(i++);
      v2 = str.charCodeAt(i++);
      v3 = str.charCodeAt(i++);
      v4 = str.charCodeAt(i++);
      v5 = str.charCodeAt(i++);
      base32Str += BASE32_ENCODE_CHAR[v1 >>> 3] +
        BASE32_ENCODE_CHAR[(v1 << 2 | v2 >>> 6) & 31] +
        BASE32_ENCODE_CHAR[(v2 >>> 1) & 31] +
        BASE32_ENCODE_CHAR[(v2 << 4 | v3 >>> 4) & 31] +
        BASE32_ENCODE_CHAR[(v3 << 1 | v4 >>> 7) & 31] +
        BASE32_ENCODE_CHAR[(v4 >>> 2) & 31] +
        BASE32_ENCODE_CHAR[(v4 << 3 | v5 >>> 5) & 31] +
        BASE32_ENCODE_CHAR[v5 & 31];
    }

    // remain char
    var remain = length - count;
    if (remain === 1) {
      v1 = str.charCodeAt(i);
      base32Str += BASE32_ENCODE_CHAR[v1 >>> 3] +
        BASE32_ENCODE_CHAR[(v1 << 2) & 31] +
        '======';
    } else if (remain === 2) {
      v1 = str.charCodeAt(i++);
      v2 = str.charCodeAt(i);
      base32Str += BASE32_ENCODE_CHAR[v1 >>> 3] +
        BASE32_ENCODE_CHAR[(v1 << 2 | v2 >>> 6) & 31] +
        BASE32_ENCODE_CHAR[(v2 >>> 1) & 31] +
        BASE32_ENCODE_CHAR[(v2 << 4) & 31] +
        '====';
    } else if (remain === 3) {
      v1 = str.charCodeAt(i++);
      v2 = str.charCodeAt(i++);
      v3 = str.charCodeAt(i);
      base32Str += BASE32_ENCODE_CHAR[v1 >>> 3] +
        BASE32_ENCODE_CHAR[(v1 << 2 | v2 >>> 6) & 31] +
        BASE32_ENCODE_CHAR[(v2 >>> 1) & 31] +
        BASE32_ENCODE_CHAR[(v2 << 4 | v3 >>> 4) & 31] +
        BASE32_ENCODE_CHAR[(v3 << 1) & 31] +
        '===';
    } else if (remain === 4) {
      v1 = str.charCodeAt(i++);
      v2 = str.charCodeAt(i++);
      v3 = str.charCodeAt(i++);
      v4 = str.charCodeAt(i);
      base32Str += BASE32_ENCODE_CHAR[v1 >>> 3] +
        BASE32_ENCODE_CHAR[(v1 << 2 | v2 >>> 6) & 31] +
        BASE32_ENCODE_CHAR[(v2 >>> 1) & 31] +
        BASE32_ENCODE_CHAR[(v2 << 4 | v3 >>> 4) & 31] +
        BASE32_ENCODE_CHAR[(v3 << 1 | v4 >>> 7) & 31] +
        BASE32_ENCODE_CHAR[(v4 >>> 2) & 31] +
        BASE32_ENCODE_CHAR[(v4 << 3) & 31] +
        '=';
    }
    return base32Str;
  };

  var encodeBytes = function (bytes) {
    var v1, v2, v3, v4, v5, base32Str = '', length = bytes.length;
    for (var i = 0, count = parseInt(length / 5) * 5; i < count;) {
      v1 = bytes[i++];
      v2 = bytes[i++];
      v3 = bytes[i++];
      v4 = bytes[i++];
      v5 = bytes[i++];
      base32Str += BASE32_ENCODE_CHAR[v1 >>> 3] +
        BASE32_ENCODE_CHAR[(v1 << 2 | v2 >>> 6) & 31] +
        BASE32_ENCODE_CHAR[(v2 >>> 1) & 31] +
        BASE32_ENCODE_CHAR[(v2 << 4 | v3 >>> 4) & 31] +
        BASE32_ENCODE_CHAR[(v3 << 1 | v4 >>> 7) & 31] +
        BASE32_ENCODE_CHAR[(v4 >>> 2) & 31] +
        BASE32_ENCODE_CHAR[(v4 << 3 | v5 >>> 5) & 31] +
        BASE32_ENCODE_CHAR[v5 & 31];
    }

    // remain char
    var remain = length - count;
    if (remain === 1) {
      v1 = bytes[i];
      base32Str += BASE32_ENCODE_CHAR[v1 >>> 3] +
        BASE32_ENCODE_CHAR[(v1 << 2) & 31] +
        '======';
    } else if (remain === 2) {
      v1 = bytes[i++];
      v2 = bytes[i];
      base32Str += BASE32_ENCODE_CHAR[v1 >>> 3] +
        BASE32_ENCODE_CHAR[(v1 << 2 | v2 >>> 6) & 31] +
        BASE32_ENCODE_CHAR[(v2 >>> 1) & 31] +
        BASE32_ENCODE_CHAR[(v2 << 4) & 31] +
        '====';
    } else if (remain === 3) {
      v1 = bytes[i++];
      v2 = bytes[i++];
      v3 = bytes[i];
      base32Str += BASE32_ENCODE_CHAR[v1 >>> 3] +
        BASE32_ENCODE_CHAR[(v1 << 2 | v2 >>> 6) & 31] +
        BASE32_ENCODE_CHAR[(v2 >>> 1) & 31] +
        BASE32_ENCODE_CHAR[(v2 << 4 | v3 >>> 4) & 31] +
        BASE32_ENCODE_CHAR[(v3 << 1) & 31] +
        '===';
    } else if (remain === 4) {
      v1 = bytes[i++];
      v2 = bytes[i++];
      v3 = bytes[i++];
      v4 = bytes[i];
      base32Str += BASE32_ENCODE_CHAR[v1 >>> 3] +
        BASE32_ENCODE_CHAR[(v1 << 2 | v2 >>> 6) & 31] +
        BASE32_ENCODE_CHAR[(v2 >>> 1) & 31] +
        BASE32_ENCODE_CHAR[(v2 << 4 | v3 >>> 4) & 31] +
        BASE32_ENCODE_CHAR[(v3 << 1 | v4 >>> 7) & 31] +
        BASE32_ENCODE_CHAR[(v4 >>> 2) & 31] +
        BASE32_ENCODE_CHAR[(v4 << 3) & 31] +
        '=';
    }
    return base32Str;
  };

  var encode = function (input, asciiOnly) {
    var notString = typeof(input) !== 'string';
    if (notString && input.constructor === ArrayBuffer) {
      input = new Uint8Array(input);
    }
    if (notString) {
      return encodeBytes(input);
    } else if (asciiOnly) {
      return encodeAscii(input);
    }
  };

  var decode = function (base32Str) {

    var v1, v2, v3, v4, v5, v6, v7, v8, str = '', length = base32Str.indexOf('=');
    if (length === -1) {
      length = base32Str.length;
    }

    // 8 char to 5 bytes
    for (var i = 0, count = length >> 3 << 3; i < count;) {
      v1 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v2 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v3 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v4 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v5 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v6 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v7 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v8 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      str += String.fromCharCode((v1 << 3 | v2 >>> 2) & 255) +
        String.fromCharCode((v2 << 6 | v3 << 1 | v4 >>> 4) & 255) +
        String.fromCharCode((v4 << 4 | v5 >>> 1) & 255) +
        String.fromCharCode((v5 << 7 | v6 << 2 | v7 >>> 3) & 255) +
        String.fromCharCode((v7 << 5 | v8) & 255);
    }

    // remain bytes
    var remain = length - count;
    if (remain === 2) {
      v1 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v2 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      str += String.fromCharCode((v1 << 3 | v2 >>> 2) & 255);
    } else if (remain === 4) {
      v1 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v2 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v3 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v4 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      str += String.fromCharCode((v1 << 3 | v2 >>> 2) & 255) +
        String.fromCharCode((v2 << 6 | v3 << 1 | v4 >>> 4) & 255);
    } else if (remain === 5) {
      v1 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v2 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v3 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v4 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v5 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      str += String.fromCharCode((v1 << 3 | v2 >>> 2) & 255) +
        String.fromCharCode((v2 << 6 | v3 << 1 | v4 >>> 4) & 255) +
        String.fromCharCode((v4 << 4 | v5 >>> 1) & 255);
    } else if (remain === 7) {
      v1 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v2 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v3 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v4 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v5 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v6 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      v7 = BASE32_DECODE_CHAR[base32Str.charAt(i++)];
      str += String.fromCharCode((v1 << 3 | v2 >>> 2) & 255) +
        String.fromCharCode((v2 << 6 | v3 << 1 | v4 >>> 4) & 255) +
        String.fromCharCode((v4 << 4 | v5 >>> 1) & 255) +
        String.fromCharCode((v5 << 7 | v6 << 2 | v7 >>> 3) & 255);
    }
    return str;
  };

	return {
		decode: decode,
		encode: encodeBinary
	}
};

function base128()
{
	var b128ec = "!#$^&'()*+,-.0123456789:<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ_`abcdefghjiklmnopqrstuvwxyz[]{|}~ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞàáâãäåæéè";

	/* Encodes a block of (up to) 7 bytes, encoding them into (up to) 8 base128 characters
	|*
	|* Method:
	|*
	|* First, the 7 bytes are split up in sets of 7 bits:
	|*
	|* Binary:  01011100 10110101 11110000 10110101 10110111 11110000 10101010
	|* Base128: 0101110 0|101101 01|11110 000|1011 0101|101 10111|11 110000|1 0101010  (| chars represent the locations where the next byte starts)
	|*
	|* These values correspond to an entry in b128ec, which is the symbol representing that value
	|*
	|* The encoder will always output 8 bytes, regardless of the length of the input
	|* If less than 7 bytes have been encoded:
	|* The amount of bytes generated is 1 + sourceLen, so when encoding 3 bytes, only use the first 4 bytes of output, instead of all 8.
	|*
	\*/

	var c = {};
	for (var k = 0; k < b128ec.length; k++)
	{
		c[b128ec[k]] = k;
	}

	function encodeblock(input)
	{
		if (!input.length)
		{
			return;
		}

		var i = new Uint8Array(7);
		for (var k = 0; k < input.length; k++)
		{
			i[k] = input[k] ? input[k].charCodeAt(0) : '!';
		}

		var idx = new Uint8Array(8);
		idx[0] =  i[0] >> 1 ;
		idx[1] =  ( (i[0] & 0x01) << 6 ) | ( i[1] >> 2 ) ;
		idx[2] =  ( (i[1] & 0x03) << 5 ) | ( i[2] >> 3 ) ;
		idx[3] =  ( (i[2] & 0x07) << 4 ) | ( i[3] >> 4 ) ;
		idx[4] =  ( (i[3] & 0x0F) << 3 ) | ( i[4] >> 5 ) ;
		idx[5] =  ( (i[4] & 0x1F) << 2 ) | ( i[5] >> 6 ) ;
		idx[6] =  ( (i[5] & 0x3F) << 1 ) | ( i[6] >> 7 ) ;
		idx[7] =  (i[6] & 0x7F);

		var out = '';
		for (var k = 0; k <= 7; k++)
		{
			out += b128ec[idx[k]];
		}

		return out;
	}


	/* Decodes a block of (up to) 8 base128 characters, encoding them into (up to) 7 bytes
	|*
	|* Method:
	|*
	|* Base128: 0101110 0|101101 01|11110 000|1011 0101|101 10111|11 110000|1 101010  (| chars represent the locations where the next byte starts)
	|* Binary:  01011100 10110101 11110000 10110101 10110111 11110000 10101010
	|*
	|*
	|* The decoder will always output 7 bytes, regardless of the length of the input
	|* If less than 8 characters have been provided:
	|* The amount of bytes generated is 1 - sourceLen, so when decoding 3 characters, only use the first 2 bytes of output, instead of all 7.
	|*
	\*/
	function decodeblock(input)
	{
		var i = new Uint8Array(8);
		for (var k = 0; k < 8; k++)
		{
			i[k] = input[k] ? c[input[k]] : 0;
		}

		var out = new Uint8Array(7);
		out[0] = (i[0] << 1) | (i[1] >> 6);
		out[1] = (i[1] << 2) | (i[2] >> 5);
		out[2] = (i[2] << 3) | (i[3] >> 4);
		out[3] = (i[3] << 4) | (i[4] >> 3);
		out[4] = (i[4] << 5) | (i[5] >> 2);
		out[5] = (i[5] << 6) | (i[6] >> 1);
		out[6] = (i[6] << 7) | (i[7]);

		return String.fromCharCode.apply(null, out);
	}

	/* Base-128 encodes the data */
	/* Returns 1 if successful, 0 otherwise */
	function Base128_Encode(data)
	{
		var output = '';
		var length = data.length;
		var w = 0;

		while (length > 0)
		{
			output += encodeblock(data.slice(w, w + 7));
			w += 7;
			length -= 7;
		}

		while (output[output.length - 1] == '!')
		{
			output = output.substr(0, output.length - 1);
		}

		return output;
	}

	function Base128_Decode(data)
	{
		var output = '';
		var length = data.length;
		var w = 0;

		while (length > 0)
		{
			output += decodeblock(data.slice(w, w + 8));
			w += 8;
			length -= 8;
		}

		while (output.charCodeAt(output.length - 1) == 0)
		{
			output = output.substr(0, output.length - 1);
		}

		return output;
	}

	return {
		decode: Base128_Decode,
		encode: Base128_Encode
	}
}