
import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
                    <Card className="w-full max-w-md border-red-200 shadow-lg">
                        <CardHeader className="space-y-1">
                            <div className="flex items-center gap-2 text-red-600">
                                <AlertCircle className="h-6 w-6" />
                                <CardTitle className="text-xl">Something went wrong</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-gray-600">
                                An error occurred while rendering this page. Please try refreshing or return to the login page.
                            </p>
                            {this.state.error && (
                                <div className="p-3 bg-red-50 border border-red-100 rounded-md text-xs text-red-800 font-mono break-all">
                                    {this.state.error.message}
                                </div>
                            )}
                            <div className="flex gap-4 pt-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => window.location.reload()}
                                >
                                    Refresh Page
                                </Button>
                                <Button
                                    className="flex-1 bg-red-600 hover:bg-red-700"
                                    onClick={() => window.location.href = "/"}
                                >
                                    Return Home
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}
