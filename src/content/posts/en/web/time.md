---
title: 'On Date and Time Formats'
pubDate: 2025-3-5
description: 'On Date and Time Formats'
author: 'dev_hee'
image:
    url: ''
    alt: ''
tags: ["Web"]

---

## Why the Concept of Time Matters in Development

In development, the concept of time matters for many reasons, such as maintaining data consistency, supporting global services, managing logs and transactions, and optimizing performance.

**1. Maintaining data consistency**

When dealing with time, if time isn't managed consistently across the server, client, and database, data integrity can break. For example, a user sends a message, but because the time zone was handled incorrectly, the recipient receives the message with a timestamp in the past. To prevent this kind of thing, we store time in UTC and convert it when needed.

📌 Solution

- All servers and databases store time in UTC
- The client converts it to the user's local time zone for display

```js
const serverTime = "2024-03-05T12:00:00Z"; // UTC time stored on the server
console.log(new Date(serverTime).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }));
```

**2. Supporting global services**

If a service only supports the time of a specific country, users in other countries may run into problems like these.

- A reservation made at 3 PM in Korea (UTC+9) may show up as 1 AM in New York, USA (UTC-5)
- The time a post or comment was written may appear differently to each user


📌 Solution

- Store all times in UTC, and convert them to each user's time zone for display
- Use Intl.DateTimeFormat() to convert to the user's local time zone

```js
const utcDate = new Date();
console.log(
  new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", dateStyle: "full", timeStyle: "long" }).format(
    utcDate
  )
);
```

**3. Managing logs and transactions**

Time is extremely important when an application records logs, transactions, and events.

- Pinpointing when an error occurred: when error logs are spread across multiple servers, debugging gets hard if each server's time is different.
- Financial services: if bank transfer records are stored differently depending on the time zone, errors can occur.
- Order processing systems: you could end up with "payment completed" happening before "order created".

📌 Solution

- Record all logs in UTC, and convert them when needed for inspection
- Include a timestamp in logs for sorting

**4. Caching and performance optimization**

If time isn't managed properly, cache-related problems can occur.

- The server caches data, but if the client's request time is different, wrong data may be served.
- When caching API responses, if "how long it's valid for" isn't clearly defined, stale data may be displayed.

📌 Solution

- Set cache expiration times in UTC, and have the client convert them to local time for display
- Set a clear expiration time in the HTTP Expires or Cache-Control header

```js
res.setHeader("Cache-Control", "public, max-age=3600"); // cache for 1 hour
```

## Ways to Represent Time

### Timestamp

A timestamp is a value that represents a specific point in time as a number. The most commonly used format is the **UNIX timestamp**, which represents the number of seconds or milliseconds elapsed since January 1, 1970, 00:00:00 UTC (Coordinated Universal Time).

- `1709558400` → March 4, 2024, 00:00:00 UTC (in seconds)
- `1709558400000` → March 4, 2024, 00:00:00 UTC (in milliseconds)

Handling timestamps in JavaScript

```js
const now = Date.now(); // current time (in milliseconds)
console.log(now);

const date = new Date(now);
console.log(date.toISOString()); // 2024-03-04T00:00:00.000Z
```

### UTC (Coordinated Universal Time)

UTC is the standard time that serves as a common reference all around the world. It's almost the same as GMT (Greenwich Mean Time), which is based on the Royal Observatory in Greenwich, England.

- `2024-03-04T00:00:00Z` → date and time in UTC
    - The reason for appending `Z` is to conform to the [ISO 8601 date standard](#iso-8601-date-standard) format.

|Format	|Description	|Example |
|----------------|--------------|----------------|
|YYYY-MM-DDTHH:mm:ss.sssZ	|Time in UTC (Z means UTC)	|2024-03-04T00:00:00Z|
|YYYY-MM-DDTHH:mm:ss.sss±HH:MM	|Includes a specific time zone	|2024-03-04T09:00:00+09:00 (KST)|
|YYYY-MM-DDTHH:mm:ss.sss	|Expressed without time zone info	|2024-03-04T09:00:00.000|

### KST (Korea Standard Time)

KST is Korea Standard Time, a time zone 9 hours ahead of UTC. In other words, it means `UTC +9`.

- `2024-03-04T09:00:00+09:00` → based on Korea time

UTC → KST conversion (JavaScript)

```js
const utcDate = new Date();
const kstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
console.log(kstDate.toISOString()); // ISO format with 9 hours added
```

### Time Zone

Countries around the world use different time zones. There are many time zones, such as Korea (KST, UTC+9), Japan (JST, UTC+9), and New York, USA (EST, UTC-5).

- KST (Korea, UTC+9)
- PST (US Pacific Standard Time, UTC-8)
- EST (US Eastern Standard Time, UTC-5)
- IST (India Standard Time, UTC+5:30)

### ISO 8601 Date Standard

ISO 8601 is the international standard format for dates and times.

- Uses the `YYYY-MM-DDTHH:mm:ss.sssZ` format
- `Z` means UTC time
- Examples:
    - `2024-03-04T00:00:00Z` → UTC
    - `2024-03-04T09:00:00+09:00` → KST (UTC+9)

## How to Convert Time in JavaScript

**1. Getting the current time**

```js
const now = new Date();
console.log(now); // current local time
console.log(now.toISOString()); // ISO 8601 format (UTC)
console.log(now.toUTCString()); // UTC string
console.log(now.toLocaleString()); // based on the user's local time
```

**2. UTC ↔ KST conversion**

- UTC → KST conversion
```js
const utcDate = new Date();
const kstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);

console.log(utcDate.toISOString()); // UTC
console.log(kstDate.toISOString()); // KST
console.log(kstDate.toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })); // Korea time
```

- KST → UTC conversion

```js
const kstToUtc = (kstDateString) => {
  const kstDate = new Date(kstDateString);
  return new Date(kstDate.getTime() - 9 * 60 * 60 * 1000);
};

console.log(kstToUtc("2024-03-04T09:00:00+09:00")); // converted to UTC
```

**3. Converting with a specific time zone applied**

`Intl.DateTimeFormat` is a standard JavaScript object that converts dates and times into a specific format and time zone.

```js
const date = new Date();

// Display the current time in the user's local time zone
console.log(new Intl.DateTimeFormat().format(now)); // e.g. 3/5/2024 (MM/DD/YYYY, varies by locale settings)

// UTC → Korea time conversion
console.log(
  new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", dateStyle: "full", timeStyle: "long" }).format(date)
);

// UTC → New York time conversion (EST)
console.log(
  new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", dateStyle: "full", timeStyle: "long" }).format(date)
);
```

**4. Unix Timestamp conversion**

- Timestamp → Date conversion

```js
const timestamp = 1709558400000; // in milliseconds
const dateFromTimestamp = new Date(timestamp);
console.log(dateFromTimestamp.toISOString()); // convert to ISO format
```

- Date → Timestamp conversion

```js
const date = new Date();
console.log(date.getTime()); // timestamp in milliseconds
console.log(Math.floor(date.getTime() / 1000)); // timestamp in seconds
```

