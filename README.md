# diem

## What?

`diem` provides the `Diem` class, a drop in replacement for the JavaScript `Date` class.  `Diem` should be used when you don't need to worry about _an exact moment in time_, but only the calendar date.  The `Diem` API is a subset of the `Date` API; the time, timezone and unix time methods are gone, leaving only years, months and days.

Here's some very basic usage:
```js
// Much of the API mirrors Date...
var d = new Diem('2020-01-01');
console.log(d.getFullYear(), d.getMonth(), d.getDate());  // 2020 0 1

d.setDate(d.getDate() - 1);
console.log(d.toISOString()); // 2019-12-31

// ...with some ome new convenience methods
var days = d.diff(new Diem(2018, 11, 31));
console.log(days); // 365

// Diem can be converted to a regular Date;
var date = d.toDate();
```
The behavior is guaranteed to be the same at any time, in any locale.

## Why?

The `Date` class is an common source of bugs.  

For example, what is the value of `year` here?
```js
var date = new Date('2020-01-01')
var year = date.getFullYear()
```
The answer depends on the where you are (and maybe even your browser).  If you happen to be east of Atlantic Ocean, the answer is 2020.
However, for folk living in the Americas, you'll get 2019.

This is because, as [Mozilla puts it](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date):
> JavaScript **`Date`** objects represent a single moment in time... `Date` objects contain a `Number` that represents milliseconds since 1 January 1970 UTC.

When built with a date string like `'2020-01-01'` with no time or timezone, the interpreter has to guess which moment in time you mean.  In the above case, it's assumed you meant "January 1st 2020, 00:00am UTC", not the worst choice. 

However `Date` methods are locale aware, so what would be the year where you are at that moment in time?  If you would still be watching the clock at an New Years Eve party, then `date.getFullYear() -> 2019`.  But if you'd be singing Auld Lang Syne, or already in bed, it's 2020. 

Keeping track of the underlying moment in time is a headache, and often unnecessary.  Consider these statements:

1) Alice's birthday is on August 2nd
2) How many days are there between the first Debate and Election Day?
3) The guest will check in on September 1st 2020 and stay for 4 nights
  
In each case there is no privileged moment in time. You shouldn't need to know which range of milliseconds is meant by each date.  
