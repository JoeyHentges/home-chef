import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core"

import { users } from "./users"

export const verifyEmailTokens = pgTable("verify_email_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  token: text("token"),
  tokenExpiresAt: timestamp("token_expires_at", { mode: "date" }),
})

export type VerifyEmailToken = typeof verifyEmailTokens.$inferSelect
