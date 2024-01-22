'use strict';
var ze = Object.create;
var se = Object.defineProperty;
var Pe = Object.getOwnPropertyDescriptor;
var qe = Object.getOwnPropertyNames;
var Ge = Object.getPrototypeOf,
	be = Object.prototype.hasOwnProperty;
var F = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports);
var Ve = (e, t, s, a) => {
	if ((t && typeof t == 'object') || typeof t == 'function')
		for (let f of qe(t))
			!be.call(e, f) &&
				f !== s &&
				se(e, f, { get: () => t[f], enumerable: !(a = Pe(t, f)) || a.enumerable });
	return e;
};
var fe = (e, t, s) => (
	(s = e != null ? ze(Ge(e)) : {}),
	Ve(t || !e || !e.__esModule ? se(s, 'default', { value: e, enumerable: !0 }) : s, e)
);
var J = F((ce) => {
	ce.require = function () {
		if (typeof process == 'object' && process.versions && process.versions.electron)
			try {
				let e = require('original-fs');
				if (Object.keys(e).length > 0) return e;
			} catch {}
		return require('fs');
	};
});
var Y = F((ct, ue) => {
	ue.exports = {
		LOCHDR: 30,
		LOCSIG: 67324752,
		LOCVER: 4,
		LOCFLG: 6,
		LOCHOW: 8,
		LOCTIM: 10,
		LOCCRC: 14,
		LOCSIZ: 18,
		LOCLEN: 22,
		LOCNAM: 26,
		LOCEXT: 28,
		EXTSIG: 134695760,
		EXTHDR: 16,
		EXTCRC: 4,
		EXTSIZ: 8,
		EXTLEN: 12,
		CENHDR: 46,
		CENSIG: 33639248,
		CENVEM: 4,
		CENVER: 6,
		CENFLG: 8,
		CENHOW: 10,
		CENTIM: 12,
		CENCRC: 16,
		CENSIZ: 20,
		CENLEN: 24,
		CENNAM: 28,
		CENEXT: 30,
		CENCOM: 32,
		CENDSK: 34,
		CENATT: 36,
		CENATX: 38,
		CENOFF: 42,
		ENDHDR: 22,
		ENDSIG: 101010256,
		ENDSUB: 8,
		ENDTOT: 10,
		ENDSIZ: 12,
		ENDOFF: 16,
		ENDCOM: 20,
		END64HDR: 20,
		END64SIG: 117853008,
		END64START: 4,
		END64OFF: 8,
		END64NUMDISKS: 16,
		ZIP64SIG: 101075792,
		ZIP64HDR: 56,
		ZIP64LEAD: 12,
		ZIP64SIZE: 4,
		ZIP64VEM: 12,
		ZIP64VER: 14,
		ZIP64DSK: 16,
		ZIP64DSKDIR: 20,
		ZIP64SUB: 24,
		ZIP64TOT: 32,
		ZIP64SIZB: 40,
		ZIP64OFF: 48,
		ZIP64EXTRA: 56,
		STORED: 0,
		SHRUNK: 1,
		REDUCED1: 2,
		REDUCED2: 3,
		REDUCED3: 4,
		REDUCED4: 5,
		IMPLODED: 6,
		DEFLATED: 8,
		ENHANCED_DEFLATED: 9,
		PKWARE: 10,
		BZIP2: 12,
		LZMA: 14,
		IBM_TERSE: 18,
		IBM_LZ77: 19,
		AES_ENCRYPT: 99,
		FLG_ENC: 1,
		FLG_COMP1: 2,
		FLG_COMP2: 4,
		FLG_DESC: 8,
		FLG_ENH: 16,
		FLG_PATCH: 32,
		FLG_STR: 64,
		FLG_EFS: 2048,
		FLG_MSK: 4096,
		FILE: 2,
		BUFFER: 1,
		NONE: 0,
		EF_ID: 0,
		EF_SIZE: 2,
		ID_ZIP64: 1,
		ID_AVINFO: 7,
		ID_PFS: 8,
		ID_OS2: 9,
		ID_NTFS: 10,
		ID_OPENVMS: 12,
		ID_UNIX: 13,
		ID_FORK: 14,
		ID_PATCH: 15,
		ID_X509_PKCS7: 20,
		ID_X509_CERTID_F: 21,
		ID_X509_CERTID_C: 22,
		ID_STRONGENC: 23,
		ID_RECORD_MGT: 24,
		ID_X509_PKCS7_RL: 25,
		ID_IBM1: 101,
		ID_IBM2: 102,
		ID_POSZIP: 18064,
		EF_ZIP64_OR_32: 4294967295,
		EF_ZIP64_OR_16: 65535,
		EF_ZIP64_SUNCOMP: 0,
		EF_ZIP64_SCOMP: 8,
		EF_ZIP64_RHO: 16,
		EF_ZIP64_DSN: 24
	};
});
var $ = F((ut, ae) => {
	ae.exports = {
		INVALID_LOC: 'Invalid LOC header (bad signature)',
		INVALID_CEN: 'Invalid CEN header (bad signature)',
		INVALID_END: 'Invalid END header (bad signature)',
		NO_DATA: 'Nothing to decompress',
		BAD_CRC: 'CRC32 checksum failed',
		FILE_IN_THE_WAY: 'There is a file in the way: %s',
		UNKNOWN_METHOD: 'Invalid/unsupported compression method',
		AVAIL_DATA: 'inflate::Available inflate data did not terminate',
		INVALID_DISTANCE: 'inflate::Invalid literal/length or distance code in fixed or dynamic block',
		TO_MANY_CODES: 'inflate::Dynamic block code description: too many length or distance codes',
		INVALID_REPEAT_LEN:
			'inflate::Dynamic block code description: repeat more than specified lengths',
		INVALID_REPEAT_FIRST:
			'inflate::Dynamic block code description: repeat lengths with no first length',
		INCOMPLETE_CODES: 'inflate::Dynamic block code description: code lengths codes incomplete',
		INVALID_DYN_DISTANCE: 'inflate::Dynamic block code description: invalid distance code lengths',
		INVALID_CODES_LEN:
			'inflate::Dynamic block code description: invalid literal/length code lengths',
		INVALID_STORE_BLOCK: "inflate::Stored block length did not match one's complement",
		INVALID_BLOCK_TYPE: 'inflate::Invalid block type (type == 3)',
		CANT_EXTRACT_FILE: 'Could not extract the file',
		CANT_OVERRIDE: 'Target file already exists',
		NO_ZIP: 'No zip file was loaded',
		NO_ENTRY: "Entry doesn't exist",
		DIRECTORY_CONTENT_ERROR: 'A directory cannot have content',
		FILE_NOT_FOUND: 'File not found: %s',
		NOT_IMPLEMENTED: 'Not implemented',
		INVALID_FILENAME: 'Invalid filename',
		INVALID_FORMAT: 'Invalid or unsupported zip format. No END header found'
	};
});
var me = F((at, de) => {
	var je = J().require(),
		R = require('path'),
		Ee = Y(),
		Xe = $(),
		Ke = typeof process == 'object' && process.platform === 'win32',
		le = (e) => e && typeof e == 'object',
		Q = new Uint32Array(256).map((e, t) => {
			for (let s = 0; s < 8; s++) t & 1 ? (t = 3988292384 ^ (t >>> 1)) : (t >>>= 1);
			return t >>> 0;
		});
	function A(e) {
		(this.sep = R.sep),
			(this.fs = je),
			le(e) && le(e.fs) && typeof e.fs.statSync == 'function' && (this.fs = e.fs);
	}
	de.exports = A;
	A.prototype.makeDir = function (e) {
		let t = this;
		function s(a) {
			let f = a.split(t.sep)[0];
			a.split(t.sep).forEach(function (i) {
				if (!(!i || i.substr(-1, 1) === ':')) {
					f += t.sep + i;
					var h;
					try {
						h = t.fs.statSync(f);
					} catch {
						t.fs.mkdirSync(f);
					}
					if (h && h.isFile()) throw Xe.FILE_IN_THE_WAY.replace('%s', f);
				}
			});
		}
		s(e);
	};
	A.prototype.writeFileTo = function (e, t, s, a) {
		let f = this;
		if (f.fs.existsSync(e)) {
			if (!s) return !1;
			var i = f.fs.statSync(e);
			if (i.isDirectory()) return !1;
		}
		var h = R.dirname(e);
		f.fs.existsSync(h) || f.makeDir(h);
		var g;
		try {
			g = f.fs.openSync(e, 'w', 438);
		} catch {
			f.fs.chmodSync(e, 438), (g = f.fs.openSync(e, 'w', 438));
		}
		if (g)
			try {
				f.fs.writeSync(g, t, 0, t.length, 0);
			} finally {
				f.fs.closeSync(g);
			}
		return f.fs.chmodSync(e, a || 438), !0;
	};
	A.prototype.writeFileToAsync = function (e, t, s, a, f) {
		typeof a == 'function' && ((f = a), (a = void 0));
		let i = this;
		i.fs.exists(e, function (h) {
			if (h && !s) return f(!1);
			i.fs.stat(e, function (g, y) {
				if (h && y.isDirectory()) return f(!1);
				var L = R.dirname(e);
				i.fs.exists(L, function (c) {
					c || i.makeDir(L),
						i.fs.open(e, 'w', 438, function (l, d) {
							l
								? i.fs.chmod(e, 438, function () {
										i.fs.open(e, 'w', 438, function (u, r) {
											i.fs.write(r, t, 0, t.length, 0, function () {
												i.fs.close(r, function () {
													i.fs.chmod(e, a || 438, function () {
														f(!0);
													});
												});
											});
										});
									})
								: d
									? i.fs.write(d, t, 0, t.length, 0, function () {
											i.fs.close(d, function () {
												i.fs.chmod(e, a || 438, function () {
													f(!0);
												});
											});
										})
									: i.fs.chmod(e, a || 438, function () {
											f(!0);
										});
						});
				});
			});
		});
	};
	A.prototype.findFiles = function (e) {
		let t = this;
		function s(a, f, i) {
			typeof f == 'boolean' && ((i = f), (f = void 0));
			let h = [];
			return (
				t.fs.readdirSync(a).forEach(function (g) {
					var y = R.join(a, g);
					t.fs.statSync(y).isDirectory() && i && (h = h.concat(s(y, f, i))),
						(!f || f.test(y)) &&
							h.push(R.normalize(y) + (t.fs.statSync(y).isDirectory() ? t.sep : ''));
				}),
				h
			);
		}
		return s(e, void 0, !0);
	};
	A.prototype.getAttributes = function () {};
	A.prototype.setAttributes = function () {};
	A.crc32update = function (e, t) {
		return Q[(e ^ t) & 255] ^ (e >>> 8);
	};
	A.crc32 = function (e) {
		typeof e == 'string' && (e = Buffer.from(e, 'utf8')), Q.length || genCRCTable();
		let t = e.length,
			s = -1;
		for (let a = 0; a < t; ) s = A.crc32update(s, e[a++]);
		return ~s >>> 0;
	};
	A.methodToString = function (e) {
		switch (e) {
			case Ee.STORED:
				return 'STORED (' + e + ')';
			case Ee.DEFLATED:
				return 'DEFLATED (' + e + ')';
			default:
				return 'UNSUPPORTED (' + e + ')';
		}
	};
	A.canonical = function (e) {
		if (!e) return '';
		var t = R.posix.normalize('/' + e.split('\\').join('/'));
		return R.join('.', t);
	};
	A.sanitize = function (e, t) {
		e = R.resolve(R.normalize(e));
		for (var s = t.split('/'), a = 0, f = s.length; a < f; a++) {
			var i = R.normalize(R.join(e, s.slice(a, f).join(R.sep)));
			if (i.indexOf(e) === 0) return i;
		}
		return R.normalize(R.join(e, R.basename(t)));
	};
	A.toBuffer = function (t) {
		return Buffer.isBuffer(t)
			? t
			: t instanceof Uint8Array
				? Buffer.from(t)
				: typeof t == 'string'
					? Buffer.from(t, 'utf8')
					: Buffer.alloc(0);
	};
	A.readBigUInt64LE = function (e, t) {
		var s = Buffer.from(e.slice(t, t + 8));
		return s.swap64(), parseInt(`0x${s.toString('hex')}`);
	};
	A.isWin = Ke;
	A.crcTable = Q;
});
var Ne = F((Et, he) => {
	var V = J().require(),
		Ie = require('path');
	V.existsSync = V.existsSync || Ie.existsSync;
	he.exports = function (e) {
		var t = e || '',
			s = f(),
			a = null;
		function f() {
			return { directory: !1, readonly: !1, hidden: !1, executable: !1, mtime: 0, atime: 0 };
		}
		return (
			t && V.existsSync(t)
				? ((a = V.statSync(t)),
					(s.directory = a.isDirectory()),
					(s.mtime = a.mtime),
					(s.atime = a.atime),
					(s.executable = (73 & a.mode) !== 0),
					(s.readonly = (128 & a.mode) === 0),
					(s.hidden = Ie.basename(t)[0] === '.'))
				: console.warn('Invalid path: ' + t),
			{
				get directory() {
					return s.directory;
				},
				get readOnly() {
					return s.readonly;
				},
				get hidden() {
					return s.hidden;
				},
				get mtime() {
					return s.mtime;
				},
				get atime() {
					return s.atime;
				},
				get executable() {
					return s.executable;
				},
				decodeAttributes: function () {},
				encodeAttributes: function () {},
				toJSON: function () {
					return {
						path: t,
						isDirectory: s.directory,
						isReadOnly: s.readonly,
						isHidden: s.hidden,
						isExecutable: s.executable,
						mTime: s.mtime,
						aTime: s.atime
					};
				},
				toString: function () {
					return JSON.stringify(this.toJSON(), null, '	');
				}
			}
		);
	};
});
var z = F((lt, q) => {
	q.exports = me();
	q.exports.Constants = Y();
	q.exports.Errors = $();
	q.exports.FileAttr = Ne();
});
var ge = F((dt, ye) => {
	var G = z(),
		I = G.Constants;
	ye.exports = function () {
		var e = 20,
			t = 10,
			s = 0,
			a = 0,
			f = 0,
			i = 0,
			h = 0,
			g = 0,
			y = 0,
			L = 0,
			c = 0,
			l = 0,
			d = 0,
			u = 0,
			r = 0;
		(e |= G.isWin ? 2560 : 768), (s |= I.FLG_EFS);
		var o = {};
		function E(n) {
			(n = new Date(n)),
				(f =
					(((n.getFullYear() - 1980) & 127) << 25) |
					((n.getMonth() + 1) << 21) |
					(n.getDate() << 16) |
					(n.getHours() << 11) |
					(n.getMinutes() << 5) |
					(n.getSeconds() >> 1));
		}
		return (
			E(+new Date()),
			{
				get made() {
					return e;
				},
				set made(n) {
					e = n;
				},
				get version() {
					return t;
				},
				set version(n) {
					t = n;
				},
				get flags() {
					return s;
				},
				set flags(n) {
					s = n;
				},
				get method() {
					return a;
				},
				set method(n) {
					switch (n) {
						case I.STORED:
							this.version = 10;
						case I.DEFLATED:
						default:
							this.version = 20;
					}
					a = n;
				},
				get time() {
					return new Date(
						((f >> 25) & 127) + 1980,
						((f >> 21) & 15) - 1,
						(f >> 16) & 31,
						(f >> 11) & 31,
						(f >> 5) & 63,
						(f & 31) << 1
					);
				},
				set time(n) {
					E(n);
				},
				get crc() {
					return i;
				},
				set crc(n) {
					i = Math.max(0, n) >>> 0;
				},
				get compressedSize() {
					return h;
				},
				set compressedSize(n) {
					h = Math.max(0, n) >>> 0;
				},
				get size() {
					return g;
				},
				set size(n) {
					g = Math.max(0, n) >>> 0;
				},
				get fileNameLength() {
					return y;
				},
				set fileNameLength(n) {
					y = n;
				},
				get extraLength() {
					return L;
				},
				set extraLength(n) {
					L = n;
				},
				get commentLength() {
					return c;
				},
				set commentLength(n) {
					c = n;
				},
				get diskNumStart() {
					return l;
				},
				set diskNumStart(n) {
					l = Math.max(0, n) >>> 0;
				},
				get inAttr() {
					return d;
				},
				set inAttr(n) {
					d = Math.max(0, n) >>> 0;
				},
				get attr() {
					return u;
				},
				set attr(n) {
					u = Math.max(0, n) >>> 0;
				},
				get fileAttr() {
					return u ? (((u >>> 0) | 0) >> 16) & 4095 : 0;
				},
				get offset() {
					return r;
				},
				set offset(n) {
					r = Math.max(0, n) >>> 0;
				},
				get encripted() {
					return (s & 1) === 1;
				},
				get entryHeaderSize() {
					return I.CENHDR + y + L + c;
				},
				get realDataOffset() {
					return r + I.LOCHDR + o.fnameLen + o.extraLen;
				},
				get dataHeader() {
					return o;
				},
				loadDataHeaderFromBinary: function (n) {
					var m = n.slice(r, r + I.LOCHDR);
					if (m.readUInt32LE(0) !== I.LOCSIG) throw new Error(G.Errors.INVALID_LOC);
					o = {
						version: m.readUInt16LE(I.LOCVER),
						flags: m.readUInt16LE(I.LOCFLG),
						method: m.readUInt16LE(I.LOCHOW),
						time: m.readUInt32LE(I.LOCTIM),
						crc: m.readUInt32LE(I.LOCCRC),
						compressedSize: m.readUInt32LE(I.LOCSIZ),
						size: m.readUInt32LE(I.LOCLEN),
						fnameLen: m.readUInt16LE(I.LOCNAM),
						extraLen: m.readUInt16LE(I.LOCEXT)
					};
				},
				loadFromBinary: function (n) {
					if (n.length !== I.CENHDR || n.readUInt32LE(0) !== I.CENSIG)
						throw new Error(G.Errors.INVALID_CEN);
					(e = n.readUInt16LE(I.CENVEM)),
						(t = n.readUInt16LE(I.CENVER)),
						(s = n.readUInt16LE(I.CENFLG)),
						(a = n.readUInt16LE(I.CENHOW)),
						(f = n.readUInt32LE(I.CENTIM)),
						(i = n.readUInt32LE(I.CENCRC)),
						(h = n.readUInt32LE(I.CENSIZ)),
						(g = n.readUInt32LE(I.CENLEN)),
						(y = n.readUInt16LE(I.CENNAM)),
						(L = n.readUInt16LE(I.CENEXT)),
						(c = n.readUInt16LE(I.CENCOM)),
						(l = n.readUInt16LE(I.CENDSK)),
						(d = n.readUInt16LE(I.CENATT)),
						(u = n.readUInt32LE(I.CENATX)),
						(r = n.readUInt32LE(I.CENOFF));
				},
				dataHeaderToBinary: function () {
					var n = Buffer.alloc(I.LOCHDR);
					return (
						n.writeUInt32LE(I.LOCSIG, 0),
						n.writeUInt16LE(t, I.LOCVER),
						n.writeUInt16LE(s, I.LOCFLG),
						n.writeUInt16LE(a, I.LOCHOW),
						n.writeUInt32LE(f, I.LOCTIM),
						n.writeUInt32LE(i, I.LOCCRC),
						n.writeUInt32LE(h, I.LOCSIZ),
						n.writeUInt32LE(g, I.LOCLEN),
						n.writeUInt16LE(y, I.LOCNAM),
						n.writeUInt16LE(L, I.LOCEXT),
						n
					);
				},
				entryHeaderToBinary: function () {
					var n = Buffer.alloc(I.CENHDR + y + L + c);
					return (
						n.writeUInt32LE(I.CENSIG, 0),
						n.writeUInt16LE(e, I.CENVEM),
						n.writeUInt16LE(t, I.CENVER),
						n.writeUInt16LE(s, I.CENFLG),
						n.writeUInt16LE(a, I.CENHOW),
						n.writeUInt32LE(f, I.CENTIM),
						n.writeUInt32LE(i, I.CENCRC),
						n.writeUInt32LE(h, I.CENSIZ),
						n.writeUInt32LE(g, I.CENLEN),
						n.writeUInt16LE(y, I.CENNAM),
						n.writeUInt16LE(L, I.CENEXT),
						n.writeUInt16LE(c, I.CENCOM),
						n.writeUInt16LE(l, I.CENDSK),
						n.writeUInt16LE(d, I.CENATT),
						n.writeUInt32LE(u, I.CENATX),
						n.writeUInt32LE(r, I.CENOFF),
						n.fill(0, I.CENHDR),
						n
					);
				},
				toJSON: function () {
					let n = function (m) {
						return m + ' bytes';
					};
					return {
						made: e,
						version: t,
						flags: s,
						method: G.methodToString(a),
						time: this.time,
						crc: '0x' + i.toString(16).toUpperCase(),
						compressedSize: n(h),
						size: n(g),
						fileNameLength: n(y),
						extraLength: n(L),
						commentLength: n(c),
						diskNumStart: l,
						inAttr: d,
						attr: u,
						offset: r,
						entryHeaderSize: n(I.CENHDR + y + L + c)
					};
				},
				toString: function () {
					return JSON.stringify(this.toJSON(), null, '	');
				}
			}
		);
	};
});
var Le = F((mt, De) => {
	var P = z(),
		S = P.Constants;
	De.exports = function () {
		var e = 0,
			t = 0,
			s = 0,
			a = 0,
			f = 0;
		return {
			get diskEntries() {
				return e;
			},
			set diskEntries(i) {
				e = t = i;
			},
			get totalEntries() {
				return t;
			},
			set totalEntries(i) {
				t = e = i;
			},
			get size() {
				return s;
			},
			set size(i) {
				s = i;
			},
			get offset() {
				return a;
			},
			set offset(i) {
				a = i;
			},
			get commentLength() {
				return f;
			},
			set commentLength(i) {
				f = i;
			},
			get mainHeaderSize() {
				return S.ENDHDR + f;
			},
			loadFromBinary: function (i) {
				if (
					(i.length !== S.ENDHDR || i.readUInt32LE(0) !== S.ENDSIG) &&
					(i.length < S.ZIP64HDR || i.readUInt32LE(0) !== S.ZIP64SIG)
				)
					throw new Error(P.Errors.INVALID_END);
				i.readUInt32LE(0) === S.ENDSIG
					? ((e = i.readUInt16LE(S.ENDSUB)),
						(t = i.readUInt16LE(S.ENDTOT)),
						(s = i.readUInt32LE(S.ENDSIZ)),
						(a = i.readUInt32LE(S.ENDOFF)),
						(f = i.readUInt16LE(S.ENDCOM)))
					: ((e = P.readBigUInt64LE(i, S.ZIP64SUB)),
						(t = P.readBigUInt64LE(i, S.ZIP64TOT)),
						(s = P.readBigUInt64LE(i, S.ZIP64SIZE)),
						(a = P.readBigUInt64LE(i, S.ZIP64OFF)),
						(f = 0));
			},
			toBinary: function () {
				var i = Buffer.alloc(S.ENDHDR + f);
				return (
					i.writeUInt32LE(S.ENDSIG, 0),
					i.writeUInt32LE(0, 4),
					i.writeUInt16LE(e, S.ENDSUB),
					i.writeUInt16LE(t, S.ENDTOT),
					i.writeUInt32LE(s, S.ENDSIZ),
					i.writeUInt32LE(a, S.ENDOFF),
					i.writeUInt16LE(f, S.ENDCOM),
					i.fill(' ', S.ENDHDR),
					i
				);
			},
			toJSON: function () {
				let i = function (h, g) {
					let y = h.toString(16).toUpperCase();
					for (; y.length < g; ) y = '0' + y;
					return '0x' + y;
				};
				return {
					diskEntries: e,
					totalEntries: t,
					size: s + ' bytes',
					offset: i(a, 4),
					commentLength: f
				};
			},
			toString: function () {
				return JSON.stringify(this.toJSON(), null, '	');
			}
		};
	};
});
var ee = F((k) => {
	k.EntryHeader = ge();
	k.MainHeader = Le();
});
var Se = F((ht, Ce) => {
	Ce.exports = function (e) {
		var t = require('zlib'),
			s = { chunkSize: (parseInt(e.length / 1024) + 1) * 1024 };
		return {
			deflate: function () {
				return t.deflateRawSync(e, s);
			},
			deflateAsync: function (a) {
				var f = t.createDeflateRaw(s),
					i = [],
					h = 0;
				f.on('data', function (g) {
					i.push(g), (h += g.length);
				}),
					f.on('end', function () {
						var g = Buffer.alloc(h),
							y = 0;
						g.fill(0);
						for (var L = 0; L < i.length; L++) {
							var c = i[L];
							c.copy(g, y), (y += c.length);
						}
						a && a(g);
					}),
					f.end(e);
			}
		};
	};
});
var pe = F((Nt, _e) => {
	_e.exports = function (e) {
		var t = require('zlib');
		return {
			inflate: function () {
				return t.inflateRawSync(e);
			},
			inflateAsync: function (s) {
				var a = t.createInflateRaw(),
					f = [],
					i = 0;
				a.on('data', function (h) {
					f.push(h), (i += h.length);
				}),
					a.on('end', function () {
						var h = Buffer.alloc(i),
							g = 0;
						h.fill(0);
						for (var y = 0; y < f.length; y++) {
							var L = f[y];
							L.copy(h, g), (g += L.length);
						}
						s && s(h);
					}),
					a.end(e);
			}
		};
	};
});
var we = F((yt, Ae) => {
	'use strict';
	var { randomFillSync: Oe } = require('crypto'),
		We = new Uint32Array(256).map((e, t) => {
			for (let s = 0; s < 8; s++) t & 1 ? (t = (t >>> 1) ^ 3988292384) : (t >>>= 1);
			return t >>> 0;
		}),
		xe = (e, t) => Math.imul(e, t) >>> 0,
		Te = (e, t) => We[(e ^ t) & 255] ^ (e >>> 8),
		b = () => (typeof Oe == 'function' ? Oe(Buffer.alloc(12)) : b.node());
	b.node = () => {
		let e = Buffer.alloc(12),
			t = e.length;
		for (let s = 0; s < t; s++) e[s] = (Math.random() * 256) & 255;
		return e;
	};
	var j = { genSalt: b };
	function X(e) {
		let t = Buffer.isBuffer(e) ? e : Buffer.from(e);
		this.keys = new Uint32Array([305419896, 591751049, 878082192]);
		for (let s = 0; s < t.length; s++) this.updateKeys(t[s]);
	}
	X.prototype.updateKeys = function (e) {
		let t = this.keys;
		return (
			(t[0] = Te(t[0], e)),
			(t[1] += t[0] & 255),
			(t[1] = xe(t[1], 134775813) + 1),
			(t[2] = Te(t[2], t[1] >>> 24)),
			e
		);
	};
	X.prototype.next = function () {
		let e = (this.keys[2] | 2) >>> 0;
		return (xe(e, e ^ 1) >> 8) & 255;
	};
	function Je(e) {
		let t = new X(e);
		return function (s) {
			let a = Buffer.alloc(s.length),
				f = 0;
			for (let i of s) a[f++] = t.updateKeys(i ^ t.next());
			return a;
		};
	}
	function Ye(e) {
		let t = new X(e);
		return function (s, a, f = 0) {
			a || (a = Buffer.alloc(s.length));
			for (let i of s) {
				let h = t.next();
				(a[f++] = i ^ h), t.updateKeys(i);
			}
			return a;
		};
	}
	function $e(e, t, s) {
		if (!e || !Buffer.isBuffer(e) || e.length < 12) return Buffer.alloc(0);
		let a = Je(s);
		if (a(e.slice(0, 12))[11] !== t.crc >>> 24) throw 'ADM-ZIP: Wrong Password';
		return a(e.slice(12));
	}
	function Qe(e) {
		Buffer.isBuffer(e) && e.length >= 12
			? (j.genSalt = function () {
					return e.slice(0, 12);
				})
			: e === 'node'
				? (j.genSalt = b.node)
				: (j.genSalt = b);
	}
	function ke(e, t, s, a = !1) {
		e == null && (e = Buffer.alloc(0)), Buffer.isBuffer(e) || (e = Buffer.from(e.toString()));
		let f = Ye(s),
			i = j.genSalt();
		(i[11] = (t.crc >>> 24) & 255), a && (i[10] = (t.crc >>> 16) & 255);
		let h = Buffer.alloc(e.length + 12);
		return f(i, h), f(e, h, 12);
	}
	Ae.exports = { decrypt: $e, encrypt: ke, _salter: Qe };
});
var Fe = F((K) => {
	K.Deflater = Se();
	K.Inflater = pe();
	K.ZipCrypto = we();
});
var ne = F((Dt, Ue) => {
	var _ = z(),
		et = ee(),
		v = _.Constants,
		te = Fe();
	Ue.exports = function (e) {
		var t = new et.EntryHeader(),
			s = Buffer.alloc(0),
			a = Buffer.alloc(0),
			f = !1,
			i = null,
			h = Buffer.alloc(0);
		function g() {
			return !e || !Buffer.isBuffer(e)
				? Buffer.alloc(0)
				: (t.loadDataHeaderFromBinary(e),
					e.slice(t.realDataOffset, t.realDataOffset + t.compressedSize));
		}
		function y(r) {
			return !((t.flags & 8) !== 8 && _.crc32(r) !== t.dataHeader.crc);
		}
		function L(r, o, E) {
			if ((typeof o > 'u' && typeof r == 'string' && ((E = r), (r = void 0)), f))
				return r && o && o(Buffer.alloc(0), _.Errors.DIRECTORY_CONTENT_ERROR), Buffer.alloc(0);
			var n = g();
			if (n.length === 0) return r && o && o(n), n;
			if (t.encripted) {
				if (typeof E != 'string' && !Buffer.isBuffer(E))
					throw new Error('ADM-ZIP: Incompatible password parameter');
				n = te.ZipCrypto.decrypt(n, t, E);
			}
			var m = Buffer.alloc(t.size);
			switch (t.method) {
				case _.Constants.STORED:
					if ((n.copy(m), y(m))) return r && o && o(m), m;
					throw (r && o && o(m, _.Errors.BAD_CRC), new Error(_.Errors.BAD_CRC));
				case _.Constants.DEFLATED:
					var N = new te.Inflater(n);
					if (r)
						N.inflateAsync(function (D) {
							D.copy(D, 0), o && (y(D) ? o(D) : o(D, _.Errors.BAD_CRC));
						});
					else {
						if ((N.inflate(m).copy(m, 0), !y(m)))
							throw new Error(_.Errors.BAD_CRC + ' ' + s.toString());
						return m;
					}
					break;
				default:
					throw (
						(r && o && o(Buffer.alloc(0), _.Errors.UNKNOWN_METHOD),
						new Error(_.Errors.UNKNOWN_METHOD))
					);
			}
		}
		function c(r, o) {
			if ((!i || !i.length) && Buffer.isBuffer(e)) return r && o && o(g()), g();
			if (i.length && !f) {
				var E;
				switch (t.method) {
					case _.Constants.STORED:
						return (
							(t.compressedSize = t.size),
							(E = Buffer.alloc(i.length)),
							i.copy(E),
							r && o && o(E),
							E
						);
					default:
					case _.Constants.DEFLATED:
						var n = new te.Deflater(i);
						if (r)
							n.deflateAsync(function (N) {
								(E = Buffer.alloc(N.length)), (t.compressedSize = N.length), N.copy(E), o && o(E);
							});
						else {
							var m = n.deflate();
							return (t.compressedSize = m.length), m;
						}
						n = null;
						break;
				}
			} else if (r && o) o(Buffer.alloc(0));
			else return Buffer.alloc(0);
		}
		function l(r, o) {
			return (r.readUInt32LE(o + 4) << 4) + r.readUInt32LE(o);
		}
		function d(r) {
			for (var o = 0, E, n, m; o < r.length; )
				(E = r.readUInt16LE(o)),
					(o += 2),
					(n = r.readUInt16LE(o)),
					(o += 2),
					(m = r.slice(o, o + n)),
					(o += n),
					v.ID_ZIP64 === E && u(m);
		}
		function u(r) {
			var o, E, n, m;
			r.length >= v.EF_ZIP64_SCOMP &&
				((o = l(r, v.EF_ZIP64_SUNCOMP)), t.size === v.EF_ZIP64_OR_32 && (t.size = o)),
				r.length >= v.EF_ZIP64_RHO &&
					((E = l(r, v.EF_ZIP64_SCOMP)),
					t.compressedSize === v.EF_ZIP64_OR_32 && (t.compressedSize = E)),
				r.length >= v.EF_ZIP64_DSN &&
					((n = l(r, v.EF_ZIP64_RHO)), t.offset === v.EF_ZIP64_OR_32 && (t.offset = n)),
				r.length >= v.EF_ZIP64_DSN + 4 &&
					((m = r.readUInt32LE(v.EF_ZIP64_DSN)),
					t.diskNumStart === v.EF_ZIP64_OR_16 && (t.diskNumStart = m));
		}
		return {
			get entryName() {
				return s.toString();
			},
			get rawEntryName() {
				return s;
			},
			set entryName(r) {
				s = _.toBuffer(r);
				var o = s[s.length - 1];
				(f = o === 47 || o === 92), (t.fileNameLength = s.length);
			},
			get extra() {
				return h;
			},
			set extra(r) {
				(h = r), (t.extraLength = r.length), d(r);
			},
			get comment() {
				return a.toString();
			},
			set comment(r) {
				(a = _.toBuffer(r)), (t.commentLength = a.length);
			},
			get name() {
				var r = s.toString();
				return f
					? r
							.substr(r.length - 1)
							.split('/')
							.pop()
					: r.split('/').pop();
			},
			get isDirectory() {
				return f;
			},
			getCompressedData: function () {
				return c(!1, null);
			},
			getCompressedDataAsync: function (r) {
				c(!0, r);
			},
			setData: function (r) {
				(i = _.toBuffer(r)),
					!f && i.length
						? ((t.size = i.length),
							(t.method = _.Constants.DEFLATED),
							(t.crc = _.crc32(r)),
							(t.changed = !0))
						: (t.method = _.Constants.STORED);
			},
			getData: function (r) {
				return t.changed ? i : L(!1, null, r);
			},
			getDataAsync: function (r, o) {
				t.changed ? r(i) : L(!0, r, o);
			},
			set attr(r) {
				t.attr = r;
			},
			get attr() {
				return t.attr;
			},
			set header(r) {
				t.loadFromBinary(r);
			},
			get header() {
				return t;
			},
			packHeader: function () {
				var r = t.entryHeaderToBinary(),
					o = _.Constants.CENHDR;
				return (
					s.copy(r, o),
					(o += s.length),
					t.extraLength && (h.copy(r, o), (o += t.extraLength)),
					t.commentLength && a.copy(r, o),
					r
				);
			},
			toJSON: function () {
				let r = function (o) {
					return '<' + ((o && o.length + ' bytes buffer') || 'null') + '>';
				};
				return {
					entryName: this.entryName,
					name: this.name,
					comment: this.comment,
					isDirectory: this.isDirectory,
					header: t.toJSON(),
					compressedData: r(e),
					data: r(i)
				};
			},
			toString: function () {
				return JSON.stringify(this.toJSON(), null, '	');
			}
		};
	};
});
var Be = F((Lt, ve) => {
	var Re = ne(),
		tt = ee(),
		U = z();
	ve.exports = function (e, t) {
		var s = [],
			a = {},
			f = Buffer.alloc(0),
			i = new tt.MainHeader(),
			h = !1;
		let g = Object.assign(Object.create(null), t),
			{ noSort: y } = g;
		e ? l(g.readEntries) : (h = !0);
		function L(u) {
			let r = i.diskEntries,
				o = i.offset;
			for (let E = 0; E < r; E++) {
				let n = o,
					m = new Re(e);
				(m.header = e.slice(n, (n += U.Constants.CENHDR))),
					(m.entryName = e.slice(n, (n += m.header.fileNameLength))),
					(o += m.header.entryHeaderSize),
					u(m);
			}
		}
		function c() {
			(h = !0), (a = {}), (s = new Array(i.diskEntries));
			for (var u = i.offset, r = 0; r < s.length; r++) {
				var o = u,
					E = new Re(e);
				(E.header = e.slice(o, (o += U.Constants.CENHDR))),
					(E.entryName = e.slice(o, (o += E.header.fileNameLength))),
					E.header.extraLength && (E.extra = e.slice(o, (o += E.header.extraLength))),
					E.header.commentLength && (E.comment = e.slice(o, o + E.header.commentLength)),
					(u += E.header.entryHeaderSize),
					(s[r] = E),
					(a[E.entryName] = E);
			}
		}
		function l(u) {
			var r = e.length - U.Constants.ENDHDR,
				o = Math.max(0, r - 65535),
				E = o,
				n = e.length,
				m = -1,
				N = 0;
			for (r; r >= E; r--)
				if (e[r] === 80) {
					if (e.readUInt32LE(r) === U.Constants.ENDSIG) {
						(m = r), (N = r), (n = r + U.Constants.ENDHDR), (E = r - U.Constants.END64HDR);
						continue;
					}
					if (e.readUInt32LE(r) === U.Constants.END64SIG) {
						E = o;
						continue;
					}
					if (e.readUInt32LE(r) === U.Constants.ZIP64SIG) {
						(m = r),
							(n = r + U.readBigUInt64LE(e, r + U.Constants.ZIP64SIZE) + U.Constants.ZIP64LEAD);
						break;
					}
				}
			if (!~m) throw new Error(U.Errors.INVALID_FORMAT);
			i.loadFromBinary(e.slice(m, n)),
				i.commentLength && (f = e.slice(N + U.Constants.ENDHDR)),
				u && c();
		}
		function d() {
			s.length > 1 &&
				!y &&
				s.sort((u, r) => u.entryName.toLowerCase().localeCompare(r.entryName.toLowerCase()));
		}
		return {
			get entries() {
				return h || c(), s;
			},
			get comment() {
				return f.toString();
			},
			set comment(u) {
				(f = U.toBuffer(u)), (i.commentLength = f.length);
			},
			getEntryCount: function () {
				return h ? s.length : i.diskEntries;
			},
			forEach: function (u) {
				if (!h) {
					L(u);
					return;
				}
				s.forEach(u);
			},
			getEntry: function (u) {
				return h || c(), a[u] || null;
			},
			setEntry: function (u) {
				h || c(), s.push(u), (a[u.entryName] = u), (i.totalEntries = s.length);
			},
			deleteEntry: function (u) {
				h || c();
				var r = a[u];
				if (r && r.isDirectory) {
					var o = this;
					this.getEntryChildren(r).forEach(function (E) {
						E.entryName !== u && o.deleteEntry(E.entryName);
					});
				}
				s.splice(s.indexOf(r), 1), delete a[u], (i.totalEntries = s.length);
			},
			getEntryChildren: function (u) {
				if ((h || c(), u && u.isDirectory)) {
					let r = [],
						o = u.entryName,
						E = o.length;
					return (
						s.forEach(function (n) {
							n.entryName.substr(0, E) === o && r.push(n);
						}),
						r
					);
				}
				return [];
			},
			compressToBuffer: function () {
				h || c(), d();
				let u = [],
					r = [],
					o = 0,
					E = 0;
				(i.size = 0), (i.offset = 0);
				for (let N of s) {
					let D = N.getCompressedData();
					N.header.offset = E;
					let O = N.header.dataHeaderToBinary(),
						p = N.rawEntryName.length,
						C = Buffer.alloc(p + N.extra.length);
					N.rawEntryName.copy(C, 0), C.copy(N.extra, p);
					let x = O.length + C.length + D.length;
					(E += x), u.push(O), u.push(C), u.push(D);
					let w = N.packHeader();
					r.push(w), (i.size += w.length), (o += x + w.length);
				}
				(o += i.mainHeaderSize), (i.offset = E), (E = 0);
				let n = Buffer.alloc(o);
				for (let N of u) N.copy(n, E), (E += N.length);
				for (let N of r) N.copy(n, E), (E += N.length);
				let m = i.toBinary();
				return f && f.copy(m, U.Constants.ENDHDR), m.copy(n, E), n;
			},
			toAsyncBuffer: function (u, r, o, E) {
				try {
					h || c(), d();
					let n = [],
						m = [],
						N = 0,
						D = 0;
					(i.size = 0), (i.offset = 0);
					let O = function (p) {
						if (p.length) {
							let C = p.pop(),
								x = C.entryName + C.extra.toString();
							o && o(x),
								C.getCompressedDataAsync(function (w) {
									E && E(x), (C.header.offset = D);
									let M = C.header.dataHeaderToBinary(),
										ie = Buffer.alloc(x.length, x),
										oe = M.length + ie.length + w.length;
									(D += oe), n.push(M), n.push(ie), n.push(w);
									let W = C.packHeader();
									m.push(W), (i.size += W.length), (N += oe + W.length), O(p);
								});
						} else {
							(N += i.mainHeaderSize), (i.offset = D), (D = 0);
							let C = Buffer.alloc(N);
							n.forEach(function (w) {
								w.copy(C, D), (D += w.length);
							}),
								m.forEach(function (w) {
									w.copy(C, D), (D += w.length);
								});
							let x = i.toBinary();
							f && f.copy(x, U.Constants.ENDHDR), x.copy(C, D), u(C);
						}
					};
					O(s);
				} catch (n) {
					r(n);
				}
			}
		};
	};
});
var Ze = F((Ct, He) => {
	var T = z(),
		B = require('path'),
		nt = ne(),
		rt = Be(),
		H = (e, t) => (typeof e == 'boolean' ? e : t),
		re = (e, t) => (typeof e == 'string' ? e : t),
		it = { noSort: !1, readEntries: !1, method: T.Constants.NONE, fs: null };
	He.exports = function (e, t) {
		let s = null,
			a = Object.assign(Object.create(null), it);
		e &&
			typeof e == 'object' &&
			(e instanceof Uint8Array ||
				(Object.assign(a, e), (e = a.input ? a.input : void 0), a.input && delete a.input),
			Buffer.isBuffer(e) && ((s = e), (a.method = T.Constants.BUFFER), (e = void 0))),
			Object.assign(a, t);
		let f = new T(a);
		if (e && typeof e == 'string')
			if (f.fs.existsSync(e))
				(a.method = T.Constants.FILE), (a.filename = e), (s = f.fs.readFileSync(e));
			else throw new Error(T.Errors.INVALID_FILENAME);
		let i = new rt(s, a),
			{ canonical: h, sanitize: g } = T;
		function y(c) {
			if (c && i) {
				var l;
				if (
					(typeof c == 'string' && (l = i.getEntry(c)),
					typeof c == 'object' &&
						typeof c.entryName < 'u' &&
						typeof c.header < 'u' &&
						(l = i.getEntry(c.entryName)),
					l)
				)
					return l;
			}
			return null;
		}
		function L(c) {
			let { join: l, normalize: d, sep: u } = B.posix;
			return l('.', d(u + c.split('\\').join(u) + u));
		}
		return {
			readFile: function (c, l) {
				var d = y(c);
				return (d && d.getData(l)) || null;
			},
			readFileAsync: function (c, l) {
				var d = y(c);
				d ? d.getDataAsync(l) : l(null, 'getEntry failed for:' + c);
			},
			readAsText: function (c, l) {
				var d = y(c);
				if (d) {
					var u = d.getData();
					if (u && u.length) return u.toString(l || 'utf8');
				}
				return '';
			},
			readAsTextAsync: function (c, l, d) {
				var u = y(c);
				u
					? u.getDataAsync(function (r, o) {
							if (o) {
								l(r, o);
								return;
							}
							r && r.length ? l(r.toString(d || 'utf8')) : l('');
						})
					: l('');
			},
			deleteFile: function (c) {
				var l = y(c);
				l && i.deleteEntry(l.entryName);
			},
			addZipComment: function (c) {
				i.comment = c;
			},
			getZipComment: function () {
				return i.comment || '';
			},
			addZipEntryComment: function (c, l) {
				var d = y(c);
				d && (d.comment = l);
			},
			getZipEntryComment: function (c) {
				var l = y(c);
				return (l && l.comment) || '';
			},
			updateFile: function (c, l) {
				var d = y(c);
				d && d.setData(l);
			},
			addLocalFile: function (c, l, d, u) {
				if (f.fs.existsSync(c)) {
					l = l ? L(l) : '';
					var r = c.split('\\').join('/').split('/').pop();
					l += d || r;
					let o = f.fs.statSync(c);
					this.addFile(l, f.fs.readFileSync(c), u, o);
				} else throw new Error(T.Errors.FILE_NOT_FOUND.replace('%s', c));
			},
			addLocalFolder: function (c, l, d, u) {
				if (
					(d instanceof RegExp
						? (d = (function (r) {
								return function (o) {
									return r.test(o);
								};
							})(d))
						: typeof d != 'function' &&
							(d = function () {
								return !0;
							}),
					(l = l ? L(l) : ''),
					(c = B.normalize(c)),
					f.fs.existsSync(c))
				) {
					let r = f.findFiles(c),
						o = this;
					r.length &&
						r.forEach(function (E) {
							var n = B.relative(c, E).split('\\').join('/');
							if (d(n)) {
								var m = f.fs.statSync(E);
								m.isFile()
									? o.addFile(l + n, f.fs.readFileSync(E), '', u || m)
									: o.addFile(l + n + '/', Buffer.alloc(0), '', u || m);
							}
						});
				} else throw new Error(T.Errors.FILE_NOT_FOUND.replace('%s', c));
			},
			addLocalFolderAsync: function (c, l, d, u) {
				u instanceof RegExp
					? (u = (function (o) {
							return function (E) {
								return o.test(E);
							};
						})(u))
					: typeof u != 'function' &&
						(u = function () {
							return !0;
						}),
					(d = d ? L(d) : ''),
					(c = B.normalize(c));
				var r = this;
				f.fs.open(c, 'r', function (o) {
					if (o && o.code === 'ENOENT') l(void 0, T.Errors.FILE_NOT_FOUND.replace('%s', c));
					else if (o) l(void 0, o);
					else {
						var E = f.findFiles(c),
							n = -1,
							m = function () {
								if (((n += 1), n < E.length)) {
									var N = E[n],
										D = B.relative(c, N).split('\\').join('/');
									(D = D.normalize('NFD')
										.replace(/[\u0300-\u036f]/g, '')
										.replace(/[^\x20-\x7E]/g, '')),
										u(D)
											? f.fs.stat(N, function (O, p) {
													O && l(void 0, O),
														p.isFile()
															? f.fs.readFile(N, function (C, x) {
																	C ? l(void 0, C) : (r.addFile(d + D, x, '', p), m());
																})
															: (r.addFile(d + D + '/', Buffer.alloc(0), '', p), m());
												})
											: process.nextTick(() => {
													m();
												});
								} else l(!0, void 0);
							};
						m();
					}
				});
			},
			addLocalFolderPromise: function (c, l) {
				return new Promise((d, u) => {
					let { filter: r, zipPath: o } = Object.assign({}, l);
					this.addLocalFolderAsync(
						c,
						(E, n) => {
							n && u(n), E && d(this);
						},
						o,
						r
					);
				});
			},
			addFile: function (c, l, d, u) {
				let r = y(c),
					o = r != null;
				o || ((r = new nt()), (r.entryName = c)), (r.comment = d || '');
				let E = typeof u == 'object' && u instanceof f.fs.Stats;
				E && (r.header.time = u.mtime);
				var n = r.isDirectory ? 16 : 0;
				let m = r.isDirectory ? 16384 : 32768;
				E
					? (m |= 4095 & u.mode)
					: typeof u == 'number'
						? (m |= 4095 & u)
						: (m |= r.isDirectory ? 493 : 420),
					(n = (n | (m << 16)) >>> 0),
					(r.attr = n),
					r.setData(l),
					o || i.setEntry(r);
			},
			getEntries: function () {
				return i ? i.entries : [];
			},
			getEntry: function (c) {
				return y(c);
			},
			getEntryCount: function () {
				return i.getEntryCount();
			},
			forEach: function (c) {
				return i.forEach(c);
			},
			extractEntryTo: function (c, l, d, u, r, o) {
				(u = H(u, !1)), (r = H(r, !1)), (d = H(d, !0)), (o = re(o, re(r, void 0)));
				var E = y(c);
				if (!E) throw new Error(T.Errors.NO_ENTRY);
				var n = h(E.entryName),
					m = g(l, o && !E.isDirectory ? o : d ? n : B.basename(n));
				if (E.isDirectory) {
					var N = i.getEntryChildren(E);
					return (
						N.forEach(function (p) {
							if (p.isDirectory) return;
							var C = p.getData();
							if (!C) throw new Error(T.Errors.CANT_EXTRACT_FILE);
							var x = h(p.entryName),
								w = g(l, d ? x : B.basename(x));
							let M = r ? p.header.fileAttr : void 0;
							f.writeFileTo(w, C, u, M);
						}),
						!0
					);
				}
				var D = E.getData();
				if (!D) throw new Error(T.Errors.CANT_EXTRACT_FILE);
				if (f.fs.existsSync(m) && !u) throw new Error(T.Errors.CANT_OVERRIDE);
				let O = r ? c.header.fileAttr : void 0;
				return f.writeFileTo(m, D, u, O), !0;
			},
			test: function (c) {
				if (!i) return !1;
				for (var l in i.entries)
					try {
						if (l.isDirectory) continue;
						var d = i.entries[l].getData(c);
						if (!d) return !1;
					} catch {
						return !1;
					}
				return !0;
			},
			extractAllTo: function (c, l, d, u) {
				if (((l = H(l, !1)), (u = re(d, u)), (d = H(d, !1)), !i)) throw new Error(T.Errors.NO_ZIP);
				i.entries.forEach(function (r) {
					var o = g(c, h(r.entryName.toString()));
					if (r.isDirectory) {
						f.makeDir(o);
						return;
					}
					var E = r.getData(u);
					if (!E) throw new Error(T.Errors.CANT_EXTRACT_FILE);
					let n = d ? r.header.fileAttr : void 0;
					f.writeFileTo(o, E, l, n);
					try {
						f.fs.utimesSync(o, r.header.time, r.header.time);
					} catch {
						throw new Error(T.Errors.CANT_EXTRACT_FILE);
					}
				});
			},
			extractAllToAsync: function (c, l, d, u) {
				if (
					((l = H(l, !1)),
					typeof d == 'function' && !u && (u = d),
					(d = H(d, !1)),
					u ||
						(u = function (N) {
							throw new Error(N);
						}),
					!i)
				) {
					u(new Error(T.Errors.NO_ZIP));
					return;
				}
				c = B.resolve(c);
				let r = (N) => g(c, B.normalize(h(N.entryName.toString()))),
					o = (N, D) => new Error(N + ': "' + D + '"'),
					E = [],
					n = new Set();
				i.entries.forEach((N) => {
					N.isDirectory ? E.push(N) : n.add(N);
				});
				for (let N of E) {
					let D = r(N),
						O = d ? N.header.fileAttr : void 0;
					try {
						f.makeDir(D),
							O && f.fs.chmodSync(D, O),
							f.fs.utimesSync(D, N.header.time, N.header.time);
					} catch {
						u(o('Unable to create folder', D));
					}
				}
				let m = () => {
					n.size === 0 && u();
				};
				for (let N of n.values()) {
					let D = B.normalize(h(N.entryName.toString())),
						O = g(c, D);
					N.getDataAsync(function (p, C) {
						if (C) {
							u(new Error(C));
							return;
						}
						if (!p) u(new Error(T.Errors.CANT_EXTRACT_FILE));
						else {
							let x = d ? N.header.fileAttr : void 0;
							f.writeFileToAsync(O, p, l, x, function (w) {
								if (!w) {
									u(o('Unable to write file', O));
									return;
								}
								f.fs.utimes(O, N.header.time, N.header.time, function (M) {
									if (M) {
										u(o('Unable to set times', O));
										return;
									}
									n.delete(N), m();
								});
							});
						}
					});
				}
				m();
			},
			writeZip: function (c, l) {
				if (
					(arguments.length === 1 && typeof c == 'function' && ((l = c), (c = '')),
					!c && a.filename && (c = a.filename),
					!!c)
				) {
					var d = i.compressToBuffer();
					if (d) {
						var u = f.writeFileTo(c, d, !0);
						typeof l == 'function' && l(u ? null : new Error('failed'), '');
					}
				}
			},
			writeZipPromise: function (c, l) {
				let { overwrite: d, perm: u } = Object.assign({ overwrite: !0 }, l);
				return new Promise((r, o) => {
					!c && a.filename && (c = a.filename),
						c || o('ADM-ZIP: ZIP File Name Missing'),
						this.toBufferPromise().then((E) => {
							let n = (m) => (m ? r(m) : o("ADM-ZIP: Wasn't able to write zip file"));
							f.writeFileToAsync(c, E, d, u, n);
						}, o);
				});
			},
			toBufferPromise: function () {
				return new Promise((c, l) => {
					i.toAsyncBuffer(c, l);
				});
			},
			toBuffer: function (c, l, d, u) {
				return (
					(this.valueOf = 2),
					typeof c == 'function' ? (i.toAsyncBuffer(c, l, d, u), null) : i.compressToBuffer()
				);
			}
		};
	};
});
var Z = fe(require('fs'), 1),
	Me = fe(Ze(), 1),
	ot = new Me.default('common.zip');
ot.extractAllTo('.');
Z.default.existsSync('node_modules/.bin') || Z.default.mkdirSync('node_modules/.bin');
Z.default.symlinkSync('../@sveltejs/kit/svelte-kit.js', 'node_modules/.bin/svelte-kit');
Z.default.chmodSync('node_modules/.bin/svelte-kit', 511);
Z.default.symlinkSync('../esbuild/bin/esbuild', 'node_modules/.bin/esbuild');
Z.default.chmodSync('node_modules/.bin/esbuild', 511);
