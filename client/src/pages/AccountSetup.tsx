import React from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogOutIcon, Shield, Key, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const AccountSetup = () => {
    const { user, logout, isLoading } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="container mx-auto py-8 max-w-4xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
                <p className="text-gray-500 mt-2">Manage your account security and preferences.</p>
            </div>

            <div className="grid gap-8">
                {/* Profile Information */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-blue-600" />
                            <CardTitle>Profile Information</CardTitle>
                        </div>
                        <CardDescription>Your basic account details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input id="username" value={user?.username || ''} disabled />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" value={user?.email || ''} disabled />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Security Settings */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Key className="h-5 w-5 text-amber-600" />
                            <CardTitle>Security</CardTitle>
                        </div>
                        <CardDescription>Update your password and security questions.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium">Change Password</h3>
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="current-password">Current Password</Label>
                                    <Input id="current-password" type="password" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new-password">New Password</Label>
                                    <Input id="new-password" type="password" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                                    <Input id="confirm-password" type="password" />
                                </div>
                            </div>
                            <Button variant="outline" className="mt-2">Update Password</Button>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <h3 className="text-sm font-medium">Security Questions</h3>
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="security-q1">Security Question 1</Label>
                                    <Input id="security-q1" placeholder="Select a question..." />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="security-a1">Answer</Label>
                                    <Input id="security-a1" type="password" />
                                </div>
                            </div>
                            <Button variant="outline" className="mt-2">Save Security Questions</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Account Actions */}
                <Card className="border-red-100 bg-red-50/10">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-red-600" />
                            <CardTitle className="text-red-900">Account Actions</CardTitle>
                        </div>
                        <CardDescription>Sign out or manage sensitive account actions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            variant="destructive"
                            onClick={handleLogout}
                            disabled={isLoading}
                            className="w-full sm:w-auto"
                        >
                            <LogOutIcon className="h-4 w-4 mr-2" />
                            {isLoading ? 'Signing out...' : 'Sign out'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AccountSetup;
