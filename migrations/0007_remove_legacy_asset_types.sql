-- Remove legacy asset types (project, trip, custom) and strip todos/sprints/insights from tabs.

DELETE FROM "todos" WHERE "asset_id" IN (
  SELECT "id" FROM "assets" WHERE "type" IN ('project', 'trip', 'custom')
);
--> statement-breakpoint
DELETE FROM "objectives" WHERE "asset_id" IN (
  SELECT "id" FROM "assets" WHERE "type" IN ('project', 'trip', 'custom')
);
--> statement-breakpoint
DELETE FROM "sprints" WHERE "asset_id" IN (
  SELECT "id" FROM "assets" WHERE "type" IN ('project', 'trip', 'custom')
);
--> statement-breakpoint
DELETE FROM "calendar_events" WHERE "asset_id" IN (
  SELECT "id" FROM "assets" WHERE "type" IN ('project', 'trip', 'custom')
);
--> statement-breakpoint
DELETE FROM "asset_activities" WHERE "asset_id" IN (
  SELECT "id" FROM "assets" WHERE "type" IN ('project', 'trip', 'custom')
);
--> statement-breakpoint
DELETE FROM "assets" WHERE "type" IN ('project', 'trip', 'custom');
--> statement-breakpoint
UPDATE "assets" AS a
SET "tabs" = v."new_tabs"
FROM (
  SELECT
    s."id",
    CASE
      WHEN cardinality(s."ft") = 0 THEN ARRAY['overview']::text[]
      WHEN NOT ('overview' = ANY(s."ft")) THEN array_cat(ARRAY['overview']::text[], s."ft")
      ELSE s."ft"
    END AS "new_tabs"
  FROM (
    SELECT
      "id",
      ARRAY(
        SELECT x
        FROM unnest(COALESCE("tabs", ARRAY[]::text[])) AS x
        WHERE x NOT IN ('todos', 'sprints', 'insights')
      ) AS "ft"
    FROM "assets"
  ) AS s
) AS v
WHERE a."id" = v."id";
