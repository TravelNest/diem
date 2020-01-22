import { inspect } from 'util';

const zeroPad = (n: number) => n < 10 ? '0' + n : n.toString();
const coerceUTC = (d: Date) => new Date(d.toISOString().substr(0, 10) + 'T00:00:00Z');

class Diem {
	private readonly midnightUTC: Date;

	constructor(value?: number | string | Date);
	constructor(year: number, month: number, date?: number);
	constructor(p1?: string | number | Date, p2?: number, p3?: number) {
		let date: Date;
		if (p1 instanceof Date) {
			date = coerceUTC(new Date(p1.getTime()));
		} else if (typeof p1 === 'string') {
			date = new Date(p1.substr(0, 10) + 'T00:00:00Z');
		} else if (typeof p1 === 'number' && p2 !== undefined) {
			date = new Date(`${p1}-${zeroPad(p2 + 1)}-${zeroPad(p3 || 1)}T00:00:00Z`);
		} else {
			date = coerceUTC(new Date());
		}
		this.midnightUTC = date;
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
		if (month !== undefined) this.setMonth(month);
		if (date !== undefined) this.setDate(date);
		return this;
	}

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
