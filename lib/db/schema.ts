import { pgTable, text, timestamp, boolean, integer, smallint, json } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
    id: text('id').primaryKey(), // Supabase Auth ID
    email: text('email').notNull(),
    name: text('name'),
    avatar: text('avatar'),
    bio: text('bio'),
    location: text('location'),
    hbarAccountId: text('hbar_account_id'),
    hbarPrivateKey: text('hbar_private_key'),
    cashoutPaymentMethod: json('cashout_payment_method'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const subscriptions = pgTable('subscriptions', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id), // Supabase Auth ID
    stripeCustomerId: text('stripe_customer_id'),
    stripeSubscriptionId: text('stripe_subscription_id'),
    stripePriceId: text('stripe_price_id'),
    planId: text('plan_id'),
    status: text('status'), // active, canceled, etc.
    cancelAtPeriodEnd: boolean('cancel_at_period_end'),
    stripeCurrentPeriodEnd: timestamp('stripe_current_period_end'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const tokens = pgTable('tokens', {
    id: text('id').primaryKey(),
    tokenId: text('token_id').notNull().unique(),
    name: text('name').notNull(),
    symbol: text('symbol').notNull(),
    decimals: text('decimals').notNull(),
    totalSupply: text('total_supply').notNull(),
    description: text('description'),
    imageUrl: text('image_url'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const cashIns = pgTable('cash_ins', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id),
    stripeCustomerId: text('stripe_customer_id'),
    stripePaymentIntentId: text('stripe_payment_intent_id'),
    amount: text('amount').notNull(), // Amount in cents
    currency: text('currency').notNull(),
    status: text('status'), // succeeded, pending, failed
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const cashOuts = pgTable('cash_outs', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id),
    amount: text('amount').notNull(),
    status: smallint('status').default(0), // Open=0, Approval=1, Rejected=2, Transfered=3
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const events = pgTable('events', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id),
    title: text('title').notNull(),
    description: text('description'),
    startTime: timestamp('start_time').notNull(),
    endTime: timestamp('end_time'),
    isLive: boolean('is_live').default(false),
    streamUrl: text('stream_url'),
    streamKey: text('stream_key'),
    thumbnailUrl: text('thumbnail_url'),
    isShort: boolean('is_short').default(false),
    hashtags: text('hashtags'),
    visibility: text('visibility').default('public'), // public, private, unlisted
    status: text('status').default('draft'), // draft, published, ended
    views: integer('views').default(0),
    lreals: integer('lreals').default(0),
    type: smallint('type'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const transfers = pgTable('transfers', {
    id: text('id').primaryKey(),
    fromUserId: text('from_user_id').notNull().references(() => users.id),
    toUserId: text('to_user_id').notNull().references(() => users.id),
    amount: text('amount').notNull(),
    status: text('status').notNull(),
    transaction: json('transaction'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
    events: many(events),
}));

export const eventsRelations = relations(events, ({ one }) => ({
    user: one(users, {
        fields: [events.userId],
        references: [users.id],
    }),
}));