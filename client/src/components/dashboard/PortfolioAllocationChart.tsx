import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface AllocationCategory {
  percentage: number;
  value: number;
}

interface PortfolioAllocation {
  total: number;
  categories: {
    stocks: AllocationCategory;
    bonds: AllocationCategory;
    realEstate: AllocationCategory;
    cash: AllocationCategory;
  };
}

interface PortfolioAllocationChartProps {
  data: PortfolioAllocation;
}

const COLORS = ['#1E88E5', '#43A047', '#FFA000', '#9C27B0'];
const RADIAN = Math.PI / 180;

const PortfolioAllocationChart = ({ data }: PortfolioAllocationChartProps) => {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (data) {
      setChartData([
        { name: 'Stocks', value: data.categories.stocks.value, percentage: data.categories.stocks.percentage },
        { name: 'Bonds', value: data.categories.bonds.value, percentage: data.categories.bonds.percentage },
        { name: 'Real Estate', value: data.categories.realEstate.value, percentage: data.categories.realEstate.percentage },
        { name: 'Cash', value: data.categories.cash.value, percentage: data.categories.cash.percentage }
      ]);
    }
  }, [data]);

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
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="px-5 py-4 border-b border-gray-200">
        <CardTitle className="text-lg font-medium text-gray-900">Portfolio Allocation</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={90}
                innerRadius={50}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(label: string) => `${label}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="col-span-1">
            {chartData.slice(0, 2).map((item, index) => (
              <div key={`item-${index}`} className="mt-1 flex justify-between items-center text-sm">
                <div className="flex items-center">
                  <span 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: COLORS[index] }}
                  ></span>
                  <span className="text-gray-600">{item.name} ({item.percentage}%)</span>
                </div>
                <span className="font-medium">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
          <div className="col-span-1">
            {chartData.slice(2, 4).map((item, index) => (
              <div key={`item-${index + 2}`} className="mt-1 flex justify-between items-center text-sm">
                <div className="flex items-center">
                  <span 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: COLORS[index + 2] }}
                  ></span>
                  <span className="text-gray-600">{item.name} ({item.percentage}%)</span>
                </div>
                <span className="font-medium">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 px-5 py-3 border-t border-gray-200">
        <a href="/portfolio" className="text-sm font-medium text-primary hover:text-primary-dark">
          View portfolio details →
        </a>
      </CardFooter>
    </Card>
  );
};

export default PortfolioAllocationChart;
