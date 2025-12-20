import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: text('id').primaryKey(), // Supabase Auth ID
    email: text('email').notNull(),
    fullName: text('full_name'),
    avatarUrl: text('avatar_url'),
    hbarAccountId: text('hbar_account_id'),
    hbarPrivateKey: text('hbar_private_key'),
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
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const conversations = pgTable('conversations', {
    id: text('id').primaryKey(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
    lastMessageAt: timestamp('last_message_at').defaultNow(),
    isEncrypted: boolean('is_encrypted').default(true),
});

export const participants = pgTable('participants', {
    conversationId: text('conversation_id').notNull().references(() => conversations.id),
    userId: text('user_id').notNull().references(() => users.id),
    lastReadAt: timestamp('last_read_at'),
}, (table) => {
    return {
        pk: { columns: [table.conversationId, table.userId] },
    };
});

export const messages = pgTable('messages', {
    id: text('id').primaryKey(),
    conversationId: text('conversation_id').notNull().references(() => conversations.id),
    senderId: text('sender_id').notNull().references(() => users.id),
    content: text('content').notNull(), // Encrypted blob if isEncrypted is true, or plain text
    type: text('type').default('text'), // text, image, etc.
    createdAt: timestamp('created_at').defaultNow(),
});