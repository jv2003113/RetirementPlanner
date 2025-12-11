import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Home,
  Car,
  CreditCard,
  PiggyBank,
  Briefcase,
  Receipt,
  Target,
  ArrowRight,
  ArrowLeft,
  Building2,
  Wallet,
  ShoppingCart
} from "lucide-react";
import type { AnnualSnapshot, AnnualSnapshotAsset, AnnualSnapshotLiability } from "@shared/schema";

interface FinancialMindMapProps {
  year: number;
  age: number;
  snapshot: AnnualSnapshot | null;
  accountBalances: AnnualSnapshotAsset[];
  isLoading: boolean;
}

interface FinancialNode {
  id: string;
  title: string;
  value: number;
  color: string;
  icon: React.ReactNode;
  category: 'income' | 'expenses' | 'assets' | 'liabilities';
  position: { x: number; y: number };
  details: Array<{ label: string; value: number; description?: string }>;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(Math.abs(value));
};

const formatPercentage = (value: number, total: number) => {
  if (total === 0) return "0%";
  return `${Math.round((Math.abs(value) / total) * 100)}%`;
};

export default function FinancialMindMap({
  year,
  age,
  snapshot,
  accountBalances,
  isLoading
}: FinancialMindMapProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Card className="w-full h-[600px]">
        <CardContent className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  if (!snapshot) {
    return (
      <Card className="w-full h-[600px]">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <Target className="h-12 w-12 mx-auto mb-4" />
            <p>Select a year on the timeline to view financial details</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Parse financial data
  const grossIncome = parseFloat(snapshot.grossIncome || "0");
  const netIncome = parseFloat(snapshot.netIncome || "0");
  const totalExpenses = parseFloat(snapshot.totalExpenses || "0");
  const totalAssets = parseFloat(snapshot.totalAssets || "0");
  const totalLiabilities = parseFloat(snapshot.totalLiabilities || "0");
  const netWorth = parseFloat(snapshot.netWorth || "0");
  const taxesPaid = parseFloat(snapshot.taxesPaid || "0");

  // Group account balances by type
  const accountsByType = accountBalances.reduce((acc, account) => {
    const type = account.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(account);
    return acc;
  }, {} as Record<string, AnnualSnapshotAsset[]>);

  // Create financial nodes for the mind map
  const nodes: FinancialNode[] = [
    // Central node - Net Worth
    {
      id: 'center',
      title: 'Net Worth',
      value: netWorth,
      color: 'bg-purple-500 border-purple-600',
      icon: <Target className="h-8 w-8 text-white" />,
      category: 'assets',
      position: { x: 50, y: 50 },
      details: [
        { label: 'Total Assets', value: totalAssets },
        { label: 'Total Liabilities', value: totalLiabilities },
        { label: 'Net Worth', value: netWorth }
      ]
    },

    // Income node (top)
    {
      id: 'income',
      title: 'Income',
      value: grossIncome,
      color: 'bg-blue-500 border-blue-600',
      icon: <Briefcase className="h-6 w-6 text-white" />,
      category: 'income',
      position: { x: 50, y: 25 },
      details: [
        { label: 'Gross Income', value: grossIncome },
        { label: 'Taxes Paid', value: taxesPaid },
        { label: 'Net Income', value: netIncome }
      ]
    },

    // Expenses node (right)
    {
      id: 'expenses',
      title: 'Expenses',
      value: totalExpenses,
      color: 'bg-red-500 border-red-600',
      icon: <Receipt className="h-6 w-6 text-white" />,
      category: 'expenses',
      position: { x: 75, y: 50 },
      details: [
        { label: 'Total Expenses', value: totalExpenses },
        { label: 'Monthly Average', value: totalExpenses / 12, description: 'Average monthly spending' }
      ]
    },

    // Assets node (bottom)
    {
      id: 'assets',
      title: 'Assets',
      value: totalAssets,
      color: 'bg-green-500 border-green-600',
      icon: <PiggyBank className="h-6 w-6 text-white" />,
      category: 'assets',
      position: { x: 50, y: 75 },
      details: Object.entries(accountsByType).map(([type, accounts]) => ({
        label: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: accounts.reduce((sum, acc) => sum + parseFloat(acc.balance || "0"), 0)
      }))
    },

    // Liabilities node (left)
    {
      id: 'liabilities',
      title: 'Liabilities',
      value: totalLiabilities,
      color: 'bg-orange-500 border-orange-600',
      icon: <CreditCard className="h-6 w-6 text-white" />,
      category: 'liabilities',
      position: { x: 25, y: 50 },
      details: [
        { label: 'Total Debt', value: totalLiabilities },
        { label: 'Debt-to-Assets Ratio', value: totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0, description: 'Percentage of assets financed by debt' }
      ]
    }
  ];

  // Always show all detail nodes - no need for click to expand

  const getDetailNodes = () => {
    const detailNodes: any[] = [];

    // Show all detail nodes for all main nodes
    nodes.filter(n => n.id !== 'center').forEach(parentNode => {
      const detailPositions = getDetailPositions(parentNode.position, parentNode.id, parentNode.details.length);

      parentNode.details.forEach((detail, index) => {
        detailNodes.push({
          id: `${parentNode.id}-detail-${index}`,
          parentId: parentNode.id,
          title: detail.label,
          value: detail.value,
          description: detail.description,
          position: detailPositions[index],
          color: 'bg-gray-600 border-gray-700',
          icon: <DollarSign className="h-4 w-4 text-white" />
        });
      });
    });

    return detailNodes;
  };

  const getDetailPositions = (parentPos: { x: number, y: number }, parentId: string, count: number) => {
    const positions: Array<{ x: number, y: number }> = [];

    // Define specific positions for each node's details to prevent overlaps
    const detailConfigs = {
      'income': [
        { x: 35, y: 8 },  // Gross Income - top left
        { x: 50, y: 8 },  // Taxes Paid - top center  
        { x: 65, y: 8 }   // Net Income - top right
      ],
      'expenses': [
        { x: 92, y: 35 }, // Total Expenses - right top
        { x: 92, y: 50 }  // Monthly Average - right center
      ],
      'assets': [
        { x: 20, y: 92 }, // First asset type - bottom far left
        { x: 35, y: 92 }, // Second asset type - bottom left
        { x: 50, y: 92 }, // Third asset type - bottom center
        { x: 65, y: 92 }, // Fourth asset type - bottom right
        { x: 80, y: 92 }  // Fifth asset type - bottom far right
      ],
      'liabilities': [
        { x: 8, y: 35 },  // Total Debt - left top
        { x: 8, y: 65 }   // Debt-to-Assets Ratio - left bottom
      ]
    };

    const config = detailConfigs[parentId as keyof typeof detailConfigs];
    if (!config) return positions;

    // Return the predefined positions, taking only as many as we need
    return config.slice(0, count);
  };

  const getConnectionLines = () => {
    const centerNode = nodes.find(n => n.id === 'center');
    if (!centerNode) return [];

    const lines: Array<{ from: { x: number, y: number }, to: { x: number, y: number }, color: string }> = [];

    // Main node connections
    nodes
      .filter(n => n.id !== 'center')
      .forEach(node => {
        lines.push({
          from: centerNode.position,
          to: node.position,
          color: node.category === 'income' || node.category === 'assets' ? '#10b981' : '#ef4444'
        });
      });

    // Detail node connections
    const detailNodes = getDetailNodes();
    detailNodes.forEach(detailNode => {
      const parentNode = nodes.find(n => n.id === detailNode.parentId);
      if (parentNode) {
        lines.push({
          from: parentNode.position,
          to: detailNode.position,
          color: '#6b7280'
        });
      }
    });

    return lines;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Financial Overview - {year} (Age {age})
          </div>
          <div className="text-sm text-gray-500">
            Complete financial breakdown
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-[600px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border overflow-hidden">
          {/* Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {getConnectionLines().map((line, index) => (
              <line
                key={index}
                x1={`${line.from.x}%`}
                y1={`${line.from.y}%`}
                x2={`${line.to.x}%`}
                y2={`${line.to.y}%`}
                stroke={line.color}
                strokeWidth="2"
                strokeOpacity="0.3"
                strokeDasharray="5,5"
              />
            ))}
          </svg>

          {/* Financial Nodes */}
          {nodes.map((node) => {
            const isCenter = node.id === 'center';
            const isHovered = hoveredNode === node.id;

            return (
              <TooltipProvider key={node.id}>
                <Tooltip>
                  <TooltipTrigger>
                    <div
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 group"
                      style={{
                        left: `${node.position.x}%`,
                        top: `${node.position.y}%`,
                        zIndex: isCenter ? 15 : 10
                      }}
                      onMouseEnter={() => setHoveredNode(node.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                    >
                      {/* Main Node Circle */}
                      <div className={`
                        ${isCenter ? 'w-20 h-20' : 'w-14 h-14'}
                        rounded-full border-4 flex items-center justify-center shadow-lg
                        transition-all duration-200 hover:shadow-xl
                        ${node.color} text-white
                        ${isHovered ? 'scale-110' : 'scale-100'}
                      `}>
                        {node.icon}
                      </div>

                      {/* Node Label */}
                      <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 text-center">
                        <div className="font-semibold text-xs text-gray-800">
                          {node.title}
                        </div>
                        <div className="font-bold text-sm text-gray-900">
                          {formatCurrency(node.value)}
                        </div>
                      </div>

                      {/* Flow Indicators */}
                      {!isCenter && (
                        <div className="absolute inset-0 pointer-events-none">
                          {node.category === 'income' && (
                            <TrendingUp className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 h-3 w-3 text-green-500" />
                          )}
                          {node.category === 'expenses' && (
                            <TrendingDown className="absolute -top-6 left-1/2 transform -translate-x-1/2 h-3 w-3 text-red-500" />
                          )}
                          {node.category === 'assets' && (
                            <TrendingUp className="absolute -top-6 left-1/2 transform -translate-x-1/2 h-3 w-3 text-green-500" />
                          )}
                          {node.category === 'liabilities' && (
                            <TrendingDown className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 h-3 w-3 text-orange-500" />
                          )}
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <div className="max-w-xs">
                      <div className="font-semibold mb-2">{node.title} Summary</div>
                      <div className="text-sm text-gray-600">
                        Total: {formatCurrency(node.value)}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}

          {/* Detail Nodes */}
          {getDetailNodes().map((detailNode) => (
            <TooltipProvider key={detailNode.id}>
              <Tooltip>
                <TooltipTrigger>
                  <div
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 animate-in fade-in zoom-in"
                    style={{
                      left: `${detailNode.position.x}%`,
                      top: `${detailNode.position.y}%`,
                      zIndex: 5
                    }}
                  >
                    {/* Detail Node Circle */}
                    <div className={`
                      w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-md
                      ${detailNode.color} text-white
                      hover:shadow-lg hover:scale-105 transition-all duration-200
                    `}>
                      <DollarSign className="h-3 w-3 text-white" />
                    </div>

                    {/* Detail Label */}
                    <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 text-center">
                      <div className="font-medium text-xs text-gray-700 max-w-[100px] truncate">
                        {detailNode.title}
                      </div>
                      <div className="font-bold text-xs text-gray-900">
                        {detailNode.title.toLowerCase().includes('ratio')
                          ? `${detailNode.value.toFixed(1)}%`
                          : formatCurrency(detailNode.value)
                        }
                      </div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <div className="max-w-xs">
                    <div className="font-semibold mb-1">{detailNode.title}</div>
                    <div className="text-lg font-bold">
                      {detailNode.title.toLowerCase().includes('ratio')
                        ? `${detailNode.value.toFixed(1)}%`
                        : formatCurrency(detailNode.value)
                      }
                    </div>
                    {detailNode.description && (
                      <div className="text-sm text-gray-600 mt-1">{detailNode.description}</div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}

        </div>

      </CardContent>
    </Card>
  );
}