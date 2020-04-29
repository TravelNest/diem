import Diem from '.';

import { register, TimeZone, unregister } from 'timezone-mock';

const sameDies = (d1: Diem | Date, d2: Diem | Date) => [
	'getFullYear', 'getMonth', 'getDate', 'getDay'
].forEach((m) => expect(d1[m]()).toEqual(d2[m]()));

const TZ: TimeZone[] = [
	'UTC',
	'Europe/London',
	'Brazil/East',
	'US/Eastern',
	'US/Pacific'
];

type AnyFn = (...a: any[]) => any;
const inAllTimezonesIt = <F extends AnyFn>(desc: string, fn: F) => it.each(TZ)('[tz=%p] ' + desc, (tz) => {
	register(tz); fn(); unregister();
});

inAllTimezonesIt.each = <F extends AnyFn>(params: Array<Parameters<F>>) => (desc: string, fn: F) => {
	const newParams = TZ.map((tz) => params.map((ps) => [tz, ...ps])).reduce((prior, current) => prior.concat(current), []);
	return it.each(newParams)('[tz=%p] ' + desc, (tz: TimeZone, ...p: Parameters<F>) => {
		register(tz);
		fn(...p);
		unregister();
	});
};

describe('Diem', () => {
	describe('test construction', () => {

		it('should handle midnight in BST', () => {
			register('Europe/London');
			// April 1st at Midnight
			const inBST = new Date(2020, 3, 1, 0, 0, 0, 0);
			expect(new Diem(inBST).toISOString()).toEqual('2020-04-01');
			unregister();
		});

		inAllTimezonesIt('should default to today', () => {
			const now = new Date();
			const today = new Diem();
			sameDies(now, today);
		});

		inAllTimezonesIt('should parse iso date strings', () => {
			const day = new Diem('2020-02-29');

			expect(day.getDate()).toEqual(29);
			expect(day.getMonth()).toEqual(1);
			expect(day.getFullYear()).toEqual(2020);
		});

		inAllTimezonesIt('should parse datetime strings', () => {
			const day = new Diem('2020-02-29 23:59');

			expect(day.getDate()).toEqual(29);
			expect(day.getMonth()).toEqual(1);
			expect(day.getFullYear()).toEqual(2020);
		});

		inAllTimezonesIt('should have equivalent constructions', () => {
			const d1 = new Diem(2020, 1, 29);
			const d2 = new Diem('2020-02-29');
			const d3 = new Diem(new Date('2020-02-29'));

			sameDies(d1, d2);
			sameDies(d1, d3);
			sameDies(d2, d3);
		});

		inAllTimezonesIt('should not matter whether input has a time component', (() => {
			const early = new Diem(new Date().setHours(0, 1));
			const midday = new Diem(new Date().setHours(12));
			const late = new Diem(new Date().setHours(23, 59));

			const today = new Diem();

			sameDies(early, today);
			sameDies(midday, today);
			sameDies(late, today);
		}));

		inAllTimezonesIt('can be updated', () => {
			const day = new Diem('2020-01-01');

			expect(day.getDate()).toEqual(1);
			expect(day.getMonth()).toEqual(0);
			expect(day.getFullYear()).toEqual(2020);

			day.setDate(day.getDate() - 1);
			sameDies(day, new Diem('2019-12-31'));

			day.setMonth(day.getMonth() - 2);
			sameDies(day, new Diem('2019-10-31'));

			day.setFullYear(day.getFullYear() - 1);
			sameDies(day, new Diem('2018-10-31'));

			expect(day.toISOString()).toEqual('2018-10-31');
		});
	});

	describe('test stringify', () => {
		it('should convert to string', () => {
			const day = new Diem('2019-12-31');
			expect(day.toString()).toEqual('Tue Dec 31 2019');
		});

		inAllTimezonesIt('should convert to ISO string', () => {
			const day = new Diem('2019-12-31');
			expect(day.toISOString()).toEqual('2019-12-31');
		});
	});

	describe('test toDate', () => {
		inAllTimezonesIt('should convert to Date', () => {
			const diem = new Diem('2020-03-29');
			const date = new Date('2020-03-29');

			expect(diem.toDate()).toEqual(date);
		});

		inAllTimezonesIt('should return a new Date instance', () => {
			const diem = new Diem('2020-03-29');

			const result = diem.toDate();

			result.setDate(20);
			expect(result.getDate()).toEqual(20);
			expect(diem.getDate()).toEqual(29);
		});
	});

	describe('test diff method', () => {
		inAllTimezonesIt.each([
			['2020-01-01', '2020-01-01', 0],
			['2020-01-02', '2020-01-01', 1],
			['2020-01-01', '2020-01-02', -1],
			['2020-01-01', '2019-01-01', 365],
			['2021-01-01', '2020-01-01', 366],
			['2020-03-30', '2020-03-27', 3],
		])('should return %p for difference of %p %p', (d1, d2, days) => {
			const diem1 = new Diem(d1);
			const diem2 = new Diem(d2);
			expect(diem1.diff(diem2)).toEqual(days);
		});
	});
});
