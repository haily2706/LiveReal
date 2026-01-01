import { createAdminClient } from "@/lib/supabase/admin";
import { db } from "@/lib/db";
import { users as usersSchema } from "@/lib/db/schema";
import { UsersTable, UserData } from "./users-table";
import { UserRole } from "@/types/role";
import { formatDistanceToNow, subDays } from "date-fns";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Users,
    UserPlus,
    UserCheck,
    Briefcase,
    Download,
    ArrowUpRight
} from "lucide-react";

export default async function UsersPage() {
    const supabase = createAdminClient();

    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error("Error fetching users:", error);
        // Handle error elegantly or throw
    }

    const totalUsers = users?.length || 0;
    const activeUsers = users?.filter(u => u.email_confirmed_at).length || 0;
    const pendingUsers = totalUsers - activeUsers;
    // Mocking "new users" logic for now as an example, or checking created_at if available
    const newUsersLast24h = users?.filter(u => new Date(u.created_at) > subDays(new Date(), 1)).length || 0;

    // Calculate percentages for "trend" visualization (mocked for demo if no history data)
    // In a real app, you'd compare with historical data.

    // Fetch user profiles from database to get additional details like location
    const dbUsers = await db.select().from(usersSchema);
    const dbUsersMap = new Map(dbUsers.map((u) => [u.id, u]));

    const formattedUsers: UserData[] = (users || []).map((user) => {
        const dbUser = dbUsersMap.get(user.id);
        return {
            id: user.id,
            name: user.user_metadata?.full_name || "Unknown",
            email: user.email || "",
            role: (user.app_metadata?.role as UserRole) || UserRole.USER,
            status: (user as any).banned_until ? "Suspended" : (user.email_confirmed_at ? "Active" : "Pending"),
            lastActive: user.last_sign_in_at
                ? `${formatDistanceToNow(new Date(user.last_sign_in_at))} ago`
                : "Never",
            avatar: user.user_metadata?.avatar_url || "",
            location: dbUser?.location || "Unknown",
        };
    });

    return (
        <div className="flex-1 space-y-6">
            <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
                    <p className="text-muted-foreground">
                        Manage your team members and their account permissions here.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    <Button>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add User
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Users
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalUsers}</div>
                        <p className="text-xs text-muted-foreground flex items-center pt-1">
                            <span className="text-emerald-500 flex items-center mr-1">
                                +2.1% <ArrowUpRight className="h-3 w-3 ml-0.5" />
                            </span>
                            from last month
                        </p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active Users
                        </CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeUsers}</div>
                        <p className="text-xs text-muted-foreground flex items-center pt-1">
                            <span className="text-emerald-500 flex items-center mr-1">
                                {activeUsers > 0 ? "+4" : "0"} <ArrowUpRight className="h-3 w-3 ml-0.5" />
                            </span>
                            since last hour
                        </p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Pending Verifications
                        </CardTitle>
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingUsers}</div>
                        <p className="text-xs text-muted-foreground">
                            Requires attention
                        </p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            New Signups
                        </CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{newUsersLast24h}</div>
                        <p className="text-xs text-muted-foreground flex items-center pt-1">
                            <span className="text-emerald-500 flex items-center mr-1">
                                +{newUsersLast24h} <ArrowUpRight className="h-3 w-3 ml-0.5" />
                            </span>
                            In the last 24 hours
                        </p>
                    </CardContent>
                </Card>
            </div>

            <UsersTable users={formattedUsers} />
        </div>
    );
}

