
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { toAvatarURL } from "@/lib/constants";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { useState, useTransition } from "react";
import { updateUserRole } from "./actions";
import { toast } from "sonner";
import { UserRole } from "@/types/role";

export type UserData = {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status: string;
    lastActive: string;
    avatar: string;
    location?: string;
};

interface UsersTableProps {
    users: UserData[];
}

export function UsersTable({ users }: UsersTableProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isPending, startTransition] = useTransition();

    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleRoleChange = (userId: string, newRole: UserRole) => {
        startTransition(async () => {
            try {
                await updateUserRole(userId, newRole);
                toast.success("User role updated successfully");
            } catch (error) {
                toast.error("Failed to update user role");
                console.error(error);
            }
        });
    };

    return (
        <div className="flex flex-col gap-8">
            <Card className="backdrop-blur-sm bg-card/50">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>All Users</CardTitle>
                            <CardDescription>
                                A list of all users in your system including their name, role, and status.
                            </CardDescription>
                        </div>
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search users..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Last Active</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={toAvatarURL(user.id)} alt={user.name} />
                                                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{user.name}</span>
                                                        {user.role !== UserRole.USER && (
                                                            <span className="text-[6px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium uppercase tracking-wider">
                                                                {user.role}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">{user.email}</span>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "h-2 w-2 rounded-full",
                                                    user.status === 'Active' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" :
                                                        user.status === 'Suspended' ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" :
                                                            "bg-gray-500 shadow-[0_0_8px_rgba(107,114,128,0.4)]"
                                                )} />
                                                <span className="capitalize text-sm font-medium">
                                                    {user.status}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {(!user.location || user.location === "Unknown") ? "" : user.location}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {user.lastActive}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.email)}>
                                                        Copy Email
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuSub>
                                                        <DropdownMenuSubTrigger>Change Role</DropdownMenuSubTrigger>
                                                        <DropdownMenuSubContent>
                                                            <DropdownMenuRadioGroup value={user.role} onValueChange={(v) => handleRoleChange(user.id, v as UserRole)}>
                                                                <DropdownMenuRadioItem value={UserRole.USER}>User</DropdownMenuRadioItem>
                                                                <DropdownMenuRadioItem value={UserRole.MANAGER}>Manager</DropdownMenuRadioItem>
                                                                <DropdownMenuRadioItem value={UserRole.ADMIN}>Admin</DropdownMenuRadioItem>
                                                            </DropdownMenuRadioGroup>
                                                        </DropdownMenuSubContent>
                                                    </DropdownMenuSub>
                                                    <DropdownMenuItem className="text-red-500">Suspend User</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
