import { sql } from "drizzle-orm";
import { text, integer, sqliteTable, real } from "drizzle-orm/sqlite-core";

export const athletes = sqliteTable("athletes", {
    id: text("id").primaryKey(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name"),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    age: integer("age"),
    ftp: integer("ftp").default(250),
    maxHr: integer("max_hr").default(190),
    weight: real("weight"),
    lastAiInsight: text("last_ai_insight"),
    lastAiInsightDate: text("last_ai_insight_date"),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const gear = sqliteTable("gear", {
    id: text("id").primaryKey(),
    athleteId: text("athlete_id").references(() => athletes.id),
    name: text("name").notNull(),
    type: text("type").notNull(), // 'Shoe', 'Bike'
    brand: text("brand"),
    model: text("model"),
    totalDistance: real("total_distance").default(0),
    isActive: integer("is_active", { mode: 'boolean' }).default(true),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const activities = sqliteTable("activities", {
    id: text("id").primaryKey(),
    athleteId: text("athlete_id").references(() => athletes.id),
    gearId: text("gear_id").references(() => gear.id),
    externalId: text("external_id"),
    name: text("name").notNull(),
    type: text("type").notNull(),
    startTime: text("start_time").notNull(),
    distance: real("distance"),
    duration: real("duration"),
    elevationGain: real("elevation_gain"),
    averageHr: integer("average_hr"),
    maxHr: integer("max_hr"),
    averagePower: integer("average_power"),
    normalizedPower: integer("normalized_power"),
    tss: real("tss"),
    trimp: real("trimp"),
    samples: text("samples"), // JSON blob for GPS/HR/Pace/Alt points
    sourceFile: text("source_file"),
    aiInsight: text("ai_insight"),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const dailyMetrics = sqliteTable("daily_metrics", {
    id: text("id").primaryKey(),
    athleteId: text("athlete_id").references(() => athletes.id),
    date: text("date").notNull(), // YYYY-MM-DD
    ctl: real("ctl"),
    atl: real("atl"),
    tsb: real("tsb"),
    acwr: real("acwr"),
    // Intensity Distribution (Seconds in each zone)
    z1Time: integer("z1_time").default(0),
    z2Time: integer("z2_time").default(0),
    z3Time: integer("z3_time").default(0),
    z4Time: integer("z4_time").default(0),
    z5Time: integer("z5_time").default(0),
    // Performance Summaries
    totalDistance: real("total_distance").default(0),
    totalDuration: real("total_duration").default(0),
    averagePace: real("average_pace"),
    averageHr: integer("average_hr"),
    maxHr: integer("max_hr"),
    sleepScore: integer("sleep_score"),
    readinessScore: integer("readiness_score"),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});
