---
title: "Partial Indexes in Postgres"
description: "How partial indexes work in PostgreSQL, when they earn their keep, and how to create one."
publishDate: "2023-03-28"
tags: ["postgres", "databases", "performance"]
---
We will talk about partial indexes in Postgres in this blog post.

A normal index covers every row of a table. A partial index covers only the rows that match a `WHERE` condition you give it. If most of your queries only care about a small slice of a big table, a partial index on that slice is smaller, faster to scan, and cheaper to keep up to date on every write.

Let's look at the cases where I have actually found them useful.

## 1. Indexing the rows you are still working on

Say you have an `orders` table with millions of rows:

```sql
CREATE TABLE orders (
  id          bigserial PRIMARY KEY,
  customer_id bigint      NOT NULL,
  status      text        NOT NULL,  -- 'pending', 'shipped', 'delivered', 'cancelled'
  created_at  timestamptz NOT NULL DEFAULT now()
);
```

Almost all orders end up `delivered`, but a background job keeps asking for the few that are still `pending`:

```sql
SELECT id, customer_id
FROM orders
WHERE status = 'pending'
ORDER BY created_at
LIMIT 100;
```

An index on `status` would mostly contain `delivered` entries that this query never reads. Index only the pending ones instead:

```sql
CREATE INDEX orders_pending_created_at_idx
  ON orders (created_at)
  WHERE status = 'pending';
```

This index stays tiny, because rows drop out of it as soon as their status changes. It also gives the query its `ORDER BY created_at` for free.

## 2. Skipping soft-deleted rows

If your app soft-deletes rows with a `deleted_at` column, nearly every query has `WHERE deleted_at IS NULL`. There is no point indexing the deleted rows:

```sql
CREATE INDEX users_email_live_idx
  ON users (email)
  WHERE deleted_at IS NULL;
```

## 3. Unique, but only for some rows

This one solves a problem a normal unique index can't. You want email addresses to be unique among active users, but a deleted user's email should be free to sign up again:

```sql
CREATE UNIQUE INDEX users_email_unique_live_idx
  ON users (lower(email))
  WHERE deleted_at IS NULL;
```

Postgres enforces uniqueness only for rows that match the condition. Here it also uses `lower(email)`, so `Foo@x.com` and `foo@x.com` count as the same address.

## When Postgres will actually use it

The planner only uses a partial index when it can prove that your query's `WHERE` clause implies the index's condition. So the query has to repeat the condition, in a form the planner recognises:

```sql
-- uses orders_pending_created_at_idx
SELECT * FROM orders WHERE status = 'pending' ORDER BY created_at LIMIT 100;

-- may not use it: a parameter could be any status
SELECT * FROM orders WHERE status = $1 ORDER BY created_at LIMIT 100;
```

The second query is a common trap with ORMs and prepared statements. Postgres plans the first few executions with the real value, but once it switches to a generic plan for the prepared statement, it can't promise that `$1` will be `'pending'`, and the partial index is out. If a query depends on a partial index, keep the condition as a literal in the SQL. Always check with `EXPLAIN`:

```sql
EXPLAIN SELECT id FROM orders WHERE status = 'pending' ORDER BY created_at LIMIT 100;
```

You want to see `Index Scan using orders_pending_created_at_idx` in the output.

## When not to use one

- **The condition matches most of the table.** An index on `WHERE status <> 'cancelled'` saves almost nothing if very few orders are cancelled.
- **The condition is a moving target.** Don't write `WHERE created_at > '2025-01-01'` and expect it to cover "recent" rows forever. The date is fixed when you create the index.
- **You index one specific customer or tenant.** A partial index per tenant doesn't scale. Put the tenant column first in a normal composite index instead.

## In Rails

If you are on Rails, migrations support partial indexes directly:

```ruby
add_index :orders, :created_at,
          where: "status = 'pending'",
          name: "orders_pending_created_at_idx"
```

That's it. Partial indexes are one of the cheapest performance wins in Postgres. Look for queries that always filter on the same small slice of a big table, index that slice, and check `EXPLAIN` to confirm the planner picks it up.
