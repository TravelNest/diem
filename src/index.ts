import { inspect } from 'util';

const zeroPad = (n: number) => n < 10 ? '0' + n : n.toString();

const coerceUTC = (d: Date) => {
	let noTz = new Date(d.getTime());
	const utcOffset = d.getTimezoneOffset();
	if (utcOffset < 0) {
		noTz = new Date(d.getTime() + (d.getTimezoneOffset() * 60 * 1000) * -1);
	}
	return new Date((noTz).toISOString().substr(0, 10) + 'T00:00:00Z');
};

class Diem {
	private readonly midnightUTC: Date;

	constructor(value?: number | string | Date | Diem);
	constructor(year: number, month: number, date?: number);
	constructor(p1?: string | number | Date | Diem, p2?: number, p3?: number) {
		let midnightUTC: Date;

		if (p1 instanceof Date) {
			midnightUTC = coerceUTC(p1);
		} else if (p1 instanceof Diem) {
			midnightUTC = coerceUTC(p1.toDate());
		} else if (typeof p1 === 'string') {
			midnightUTC = new Date(p1.substr(0, 10) + 'T00:00:00Z');
		} else if (typeof p1 === 'number' && p2 !== undefined) {
			midnightUTC = new Date(`${p1}-${zeroPad(p2 + 1)}-${zeroPad(p3 || 1)}T00:00:00Z`);
		} else {
			midnightUTC = coerceUTC(new Date());
		}
		this.midnightUTC = midnightUTC;
	}

	public getDate = () => this.midnightUTC.getUTCDate();
	public getDay = () => this.midnightUTC.getUTCDay();
	public getMonth = () => this.midnightUTC.getUTCMonth();
	public getFullYear = () => this.midnightUTC.getUTCFullYear();

	public setDate = (date: number) => {
		this.midnightUTC.setUTCDate(date);
		return this;
	}
	public setMonth = (month: number, date?: number) => {
		this.midnightUTC.setUTCMonth(month);
		if (date !== undefined) this.setDate(date);
		return this;
	}
	public setFullYear = (year: number, month?: number, date?: number) => {
		this.midnightUTC.setUTCFullYear(year);
		if (month !== undefined) this.setMonth(month, date);
		return this;
	}

	/**
	 * Compare this Diem to another Diem (or Date).
	 *
	 * @param {Diem | Date} that - The date-like to compare to.
	 *
	 * @returns {number} diff - The number of days between "this" and "that".
	 *
	 * @example
	 *
	 * new Diem('2020-06-01').diff(new Diem('2020-06-10'))  // returns -9 (9 days before)
	 *
	 * new Diem('2020-06-01').diff(new Diem('2020-05-28'))  // returns 3 (3 days after)
	 *
	 * new Diem('2020-06-01').diff(new Diem('2020-06-01'))  // return 0 (same day)
	 */
	public diff = (that: Diem | Date) => {
		const MS_IN_DAY = 1000 * 60 * 60 * 24;

		const d1 = this.midnightUTC;
		const d2 = that instanceof Diem ? that.midnightUTC : coerceUTC(that);

		const ms = d1.getTime() - d2.getTime();
		return Math.round(ms / MS_IN_DAY);
	}

	public toString = () => this.midnightUTC.toString().split(' ').slice(0, 4).join(' ');
	public toISOString = () => this.midnightUTC.toISOString().split('T')[0];

	public toDate = () => new Date(this.toISOString());
}

Diem.prototype[inspect.custom] = function() {
	return this.toString();
};

export default Diem;
