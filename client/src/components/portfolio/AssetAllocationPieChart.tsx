import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface InvestmentAccount {
  id: string;
  accountName: string;
  balance: number;
}

interface AssetAllocationPieChartProps {
  accounts: InvestmentAccount[];
}

const COLORS = ['#1E88E5', '#43A047', '#FFA000', '#9C27B0', '#F44336', '#607D8B'];
const RADIAN = Math.PI / 180;

const AssetAllocationPieChart = ({ accounts }: AssetAllocationPieChartProps) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [aggregatedData, setAggregatedData] = useState<Record<string, { value: number; percentage: number }>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch asset allocations for all accounts
  const fetchAllAllocations = async () => {
    setIsLoading(true);

    try {
      // Storing promises for all allocation queries
      const allocationPromises = accounts.map(account =>
        fetch(`/api/investment-accounts/${account.id}/asset-allocations`)
          .then(res => res.json())
          .then(allocations => ({ accountId: account.id, allocations }))
      );

      // Wait for all promises to resolve
      const results = await Promise.all(allocationPromises);

      // Initialize aggregated data structure
      const aggregated: Record<string, { value: number; percentage: number }> = {
        stocks: { value: 0, percentage: 0 },
        bonds: { value: 0, percentage: 0 },
        real_estate: { value: 0, percentage: 0 },
        cash: { value: 0, percentage: 0 },
        other: { value: 0, percentage: 0 }
      };

      // Process and aggregate the allocations
      let totalValue = 0;

      results.forEach(result => {
        result.allocations.forEach((allocation: any) => {
          const category = allocation.assetCategory;
          const value = Number(allocation.value);

          if (aggregated[category]) {
            aggregated[category].value += value;
          } else {
            aggregated[category] = { value, percentage: 0 };
          }

          totalValue += value;
        });
      });

      // Calculate percentages
      Object.keys(aggregated).forEach(category => {
        if (totalValue > 0) {
          aggregated[category].percentage = Math.round((aggregated[category].value / totalValue) * 100);
        }
      });

      // Filter out categories with zero value
      const filteredAggregated = Object.fromEntries(
        Object.entries(aggregated).filter(([_, data]) => data.value > 0)
      );

      setAggregatedData(filteredAggregated);

      // Prepare chart data
      const chartDataArray = Object.entries(filteredAggregated).map(([category, data]) => ({
        name: category.replace('_', ' '),
        value: data.value,
        percentage: data.percentage
      }));

      setChartData(chartDataArray);
    } catch (error) {
      console.error("Error fetching asset allocations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (accounts && accounts.length > 0) {
      fetchAllAllocations();
    } else {
      setIsLoading(false);
    }
  }, [accounts]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading asset allocation data...</div>;
  }

  if (chartData.length === 0) {
    return <div className="flex items-center justify-center h-full">No asset allocation data available.</div>;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent, index
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0.05 ? (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={14}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={120}
            innerRadius={60}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            labelFormatter={(label: string) => `${label.charAt(0).toUpperCase() + label.slice(1)}`}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 gap-2 mt-4">
        {chartData.map((item, index) => (
          <div key={`legend-${index}`} className="flex items-center">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            ></div>
            <span className="text-sm capitalize">{item.name}</span>
            <span className="text-sm ml-1 text-gray-500">({item.percentage}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetAllocationPieChart;
