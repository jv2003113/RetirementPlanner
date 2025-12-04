import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Security } from "@/lib/securities-api";
import { Edit, Trash2, Plus } from "lucide-react";

interface SecurityHolding {
  id: string;
  accountId: string;
  ticker: string;
  name: string | null;
  percentage: string;
  assetClass: string | null;
  region: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SecurityHoldingsProps {
  accountId: string;
  accountName: string;
  onAddHolding: (accountId: string) => void;
  onEditHolding: (holding: SecurityHolding) => void;
  onDeleteHolding: (holdingId: string) => void;
}

const SecurityHoldings = ({
  accountId,
  accountName,
  onAddHolding,
  onEditHolding,
  onDeleteHolding,
}: SecurityHoldingsProps) => {
  const { data: holdings, isLoading, error } = useQuery<SecurityHolding[]>({
    queryKey: [`/api/investment-accounts/${accountId}/security-holdings`],
  });

  const getAssetClassColor = (assetClass: string | null) => {
    switch (assetClass) {
      case "stock":
        return "#4f46e5";
      case "bond":
        return "#10b981";
      case "cash":
        return "#eab308";
      case "real_estate":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getRegionBadge = (region: string | null) => {
    if (!region) return null;

    let color;
    switch (region) {
      case "domestic":
        color = "bg-blue-100 text-blue-800";
        break;
      case "international":
        color = "bg-green-100 text-green-800";
        break;
      case "emerging":
        color = "bg-purple-100 text-purple-800";
        break;
      case "global":
        color = "bg-gray-100 text-gray-800";
        break;
      default:
        color = "bg-gray-100 text-gray-800";
    }

    return (
      <Badge variant="outline" className={`${color} font-normal capitalize`}>
        {region.replace("_", " ")}
      </Badge>
    );
  };

  // Calculate data for the pie chart
  const pieChartData = holdings?.map(holding => ({
    name: holding.ticker,
    value: parseFloat(holding.percentage),
    assetClass: holding.assetClass,
  })) || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-2/3 mb-2" />
          <Skeleton className="h-3 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Securities in {accountName}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-500">Error loading security holdings</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Securities in {accountName}</CardTitle>
            <CardDescription>
              Individual securities in this investment account
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddHolding(accountId)}
          >
            <Plus className="mr-1 h-4 w-4" /> Add Security
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!holdings || holdings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-4">No securities added to this account yet.</p>
            <Button onClick={() => onAddHolding(accountId)}>
              Add Your First Security
            </Button>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticker</TableHead>
                      <TableHead>Allocation</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {holdings.map((holding) => (
                      <TableRow key={holding.id}>
                        <TableCell className="font-medium">
                          {holding.ticker}
                          {holding.name && (
                            <div className="text-xs text-gray-500 truncate max-w-[150px]">
                              {holding.name}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{holding.percentage}%</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div
                              className="h-3 w-3 rounded-full mr-2"
                              style={{
                                backgroundColor: getAssetClassColor(holding.assetClass),
                              }}
                            ></div>
                            <span className="capitalize">
                              {holding.assetClass?.replace("_", " ") || "Unspecified"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getRegionBadge(holding.region)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEditHolding(holding)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDeleteHolding(holding.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={getAssetClassColor(entry.assetClass)}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value}%`, "Allocation"]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SecurityHoldings;