import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";

export async function checkUsers() {
    const allUsers = await db.select().from(users).limit(5);
    console.log("All Users:", allUsers);
    return allUsers;
}
