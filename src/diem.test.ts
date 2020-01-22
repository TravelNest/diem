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

		it('can be updated', () => {
			const day = new Diem('2020-01-01');

			expect(day.getDate()).toEqual(1);
			expect(day.getMonth()).toEqual(0);
			expect(day.getFullYear()).toEqual(2020);

			day.setDate(day.getDate() - 1);

			sameDies(day, new Diem('2019-12-31'));
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

	describe(`test diff method (tz=${CURRENT_TZ})`, () => {
		it.each`
			d1              | d2              | days
			${'2020-01-01'} | ${'2020-01-01'} | ${0}
			${'2020-01-02'} | ${'2020-01-01'} | ${1}
			${'2020-01-01'} | ${'2020-01-02'} | ${-1}
			${'2020-01-01'} | ${'2019-01-01'} | ${365}
			${'2021-01-01'} | ${'2020-01-01'} | ${366}
		`('should return $days for difference of $d1 $d2', tzRepeat(({ d1, d2, days }) => {
			expect(new Diem(d1).diff(new Diem(d2))).toEqual(days);
		}));
	});
}));
