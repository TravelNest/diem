import { inspect } from 'util';

class Diem {
	private readonly date: Date;

	constructor(value?: number | string | Date);
	constructor(year: number, month: number, date?: number);
	constructor(p1?: string | number | Date, p2?: number, p3?: number) {
		let date: Date;
		if (p1 instanceof Date) {
			date = p1;
		} else if (typeof p1 === 'string') {
			date = new Date(p1);
		} else if (typeof p1 === 'number' && p2 !== undefined) {
			date = new Date(p1, p2, p3);
		} else {
			date = new Date();
		}
		date.setHours(0, 0, 0, 0);
		this.date = date;
	}

	public getDate = () => this.date.getDate();
	public getDay = () => this.date.getDay();
	public getMonth = () => this.date.getMonth();
	public getFullYear = () => this.date.getFullYear();

	public setDate = (date: number) => {
		this.date.setDate(date);
		return this;
	}
	public setMonth = (month: number, date?: number) => {
		this.date.setMonth(month, date);
		return this;
	}
	public setFullYear = (year: number, month?: number, date?: number) => {
		this.date.setFullYear(year, month, date);
		return this;
	}

	public diff = (that: Diem | Date) => {
		const MS_IN_DAY = 1000 * 60 * 60 * 24;

		const d1 = this.date;
		const d2 = that instanceof Diem ? that.date : that;

		const ms = d1.getTime() - d2.getTime();
		return Math.round(ms / MS_IN_DAY);
	}

	public toString = () => this.date.toString().split(' ').slice(0, 4).join(' ');
	public toISOString = () => this.date.toISOString().split('T')[0];

	public toDate = () => this.date;
}

Diem.prototype[inspect.custom] = function() {
	return this.toString();
};

export default Diem;
