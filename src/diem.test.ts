import Diem from '.';

import { register, TimeZone, unregister } from 'timezone-mock';

let CURRENT_TZ = 'Default';
const registerTz = (tz: TimeZone) => { CURRENT_TZ = tz; register(tz); };
const unregisterTz = () => { unregister(); CURRENT_TZ = 'Default'; };

const sameDies = (d1: Diem | Date, d2: Diem | Date) => [
	'getFullYear', 'getMonth', 'getDate', 'getDay'
].forEach((m) => expect(d1[m]()).toEqual(d2[m]()));

const tzRepeat = <F extends (...a: any[]) => any>(test: F) => (...args: Parameters<F>) => ([
	'UTC',
	'Europe/London',
	'Brazil/East',
	'US/Eastern',
	'US/Pacific'
] as TimeZone[]).forEach((tz) => { registerTz(tz); test(...args); unregisterTz(); });

describe('Diem', tzRepeat(() => {
	describe(`test construction (tz=${CURRENT_TZ})`, () => {
		it('should default to today', (() => {
			const now = new Date();
			const today = new Diem();

			sameDies(now, today);
		}));

		it('should parse iso date strings', () => {
			const day = new Diem('2020-02-29');

			expect(day.getDate()).toEqual(29);
			expect(day.getMonth()).toEqual(1);
			expect(day.getFullYear()).toEqual(2020);
			expect(day.toString()).toEqual('Sat Feb 29 2020');
		});

		it('should have equivalent constructions', () => {
			const d1 = new Diem(2020, 1, 29);
			const d2 = new Diem('2020-02-29');
			const d3 = new Diem(new Date('2020-02-29'));

			sameDies(d1, d2);
			sameDies(d1, d3);
			sameDies(d2, d3);
		});

		it('should not matter whether input has a time component', (() => {
			const early = new Diem(new Date().setHours(0, 1));
			const midday = new Diem(new Date().setHours(12));
			const late = new Diem(new Date().setHours(23, 59));

			const today = new Diem();

			sameDies(early, today);
			sameDies(midday, today);
			sameDies(late, today);
		}));

		it('can be updated', () => {
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
		});
	});

	describe(`test stringify (tz=${CURRENT_TZ})`, () => {
		it('should convert to string', () => {
			const day = new Diem('2019-12-31');
			expect(day.toString()).toEqual('Tue Dec 31 2019');
		});

		it('should convert to ISO string', () => {
			const day = new Diem('2019-12-31');
			expect(day.toISOString()).toEqual('2019-12-31');
		});
	});

	describe(`test toDate (tz=${CURRENT_TZ})`, () => {
		it('should convert to Date', () => {
			const diem = new Diem('2020-03-29');
			const date = new Date(2020, 2, 29, 0, 0, 0, 0);

			expect(diem.toDate()).toEqual(date);
		});

		it('should return a new Date instance', () => {
			const diem = new Diem('2020-03-29');

			const result = diem.toDate();

			result.setDate(20);
			expect(result.getDate()).toEqual(20);
			expect(diem.getDate()).toEqual(29);
		});
	});

	describe(`test diff method (tz=${CURRENT_TZ})`, () => {
		it.each`
			d1              | d2              | days
			${'2020-01-01'} | ${'2020-01-01'} | ${0}
			${'2020-01-02'} | ${'2020-01-01'} | ${1}
			${'2020-01-01'} | ${'2020-01-02'} | ${-1}
			${'2020-01-01'} | ${'2019-01-01'} | ${365}
			${'2021-01-01'} | ${'2020-01-01'} | ${366}
			${'2020-03-30'} | ${'2020-03-27'} | ${3}
		`('should return $days for difference of $d1 $d2', ({ d1, d2, days }) => {
			const diem1 = new Diem(d1);
			const diem2 = new Diem(d2);
			expect(diem1.diff(diem2)).toEqual(days);

			const rebuildWithTime = (d: Diem, h: number, m: number, s: number, ms: number) =>
				new Diem(new Date(d.toDate().setHours(h, m, s, ms)));

			expect(rebuildWithTime(diem1, 0, 0, 0, 1).diff(rebuildWithTime(diem2, 23, 59, 59, 999))).toEqual(days);
		});
	});
}));
