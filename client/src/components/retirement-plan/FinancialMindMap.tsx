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
import type { AnnualSnapshot, AccountBalance } from "@shared/schema";

interface FinancialMindMapProps {
  year: number;
  age: number;
  snapshot: AnnualSnapshot | null;
  accountBalances: AccountBalance[];
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
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

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
    const type = account.accountType;
    if (!acc[type]) acc[type] = [];
    acc[type].push(account);
    return acc;
  }, {} as Record<string, AccountBalance[]>);

  // Create financial nodes for the mind map
  const nodes: FinancialNode[] = [
    // Central node - Net Worth
    {
      id: 'center',
      title: 'Net Worth',
      value: netWorth,
      color: netWorth >= 0 ? 'bg-green-500 border-green-600' : 'bg-red-500 border-red-600',
      icon: <Target className="h-8 w-8 text-white" />,
      category: 'assets',
      position: { x: 50, y: 50 },
      details: [
        { label: 'Total Assets', value: totalAssets },
        { label: 'Total Liabilities', value: totalLiabilities },
        { label: 'Net Worth', value: netWorth }
      ]
    },

    // Income node (top-left)
    {
      id: 'income',
      title: 'Income',
      value: grossIncome,
      color: 'bg-blue-500 border-blue-600',
      icon: <Briefcase className="h-6 w-6 text-white" />,
      category: 'income',
      position: { x: 15, y: 15 },
      details: [
        { label: 'Gross Income', value: grossIncome },
        { label: 'Taxes Paid', value: taxesPaid },
        { label: 'Net Income', value: netIncome }
      ]
    },

    // Expenses node (top-right)
    {
      id: 'expenses',
      title: 'Expenses',
      value: totalExpenses,
      color: 'bg-red-500 border-red-600',
      icon: <Receipt className="h-6 w-6 text-white" />,
      category: 'expenses',
      position: { x: 85, y: 15 },
      details: [
        { label: 'Total Expenses', value: totalExpenses },
        { label: 'Monthly Average', value: totalExpenses / 12, description: 'Average monthly spending' }
      ]
    },

    // Assets node (bottom-left)
    {
      id: 'assets',
      title: 'Assets',
      value: totalAssets,
      color: 'bg-green-500 border-green-600',
      icon: <PiggyBank className="h-6 w-6 text-white" />,
      category: 'assets',
      position: { x: 15, y: 85 },
      details: Object.entries(accountsByType).map(([type, accounts]) => ({
        label: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: accounts.reduce((sum, acc) => sum + parseFloat(acc.balance || "0"), 0)
      }))
    },

    // Liabilities node (bottom-right)
    {
      id: 'liabilities',
      title: 'Liabilities',
      value: totalLiabilities,
      color: 'bg-orange-500 border-orange-600',
      icon: <CreditCard className="h-6 w-6 text-white" />,
      category: 'liabilities',
      position: { x: 85, y: 85 },
      details: [
        { label: 'Total Debt', value: totalLiabilities },
        { label: 'Debt-to-Assets Ratio', value: totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0, description: 'Percentage of assets financed by debt' }
      ]
    }
  ];

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(selectedNode === nodeId ? null : nodeId);
  };

  const getConnectionLines = () => {
    const centerNode = nodes.find(n => n.id === 'center');
    if (!centerNode) return [];

    return nodes
      .filter(n => n.id !== 'center')
      .map(node => ({
        from: centerNode.position,
        to: node.position,
        color: node.category === 'income' || node.category === 'assets' ? '#10b981' : '#ef4444'
      }));
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
            Click nodes for details
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-[500px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border overflow-hidden">
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
            const isSelected = selectedNode === node.id;
            const isHovered = hoveredNode === node.id;
            
            return (
              <TooltipProvider key={node.id}>
                <Tooltip>
                  <TooltipTrigger>
                    <div
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 group"
                      style={{ 
                        left: `${node.position.x}%`, 
                        top: `${node.position.y}%`,
                        zIndex: isSelected ? 20 : isCenter ? 15 : 10
                      }}
                      onClick={() => handleNodeClick(node.id)}
                      onMouseEnter={() => setHoveredNode(node.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                    >
                      {/* Main Node Circle */}
                      <div className={`
                        ${isCenter ? 'w-24 h-24' : 'w-16 h-16'}
                        rounded-full border-4 flex items-center justify-center shadow-lg
                        transition-all duration-200 hover:shadow-xl
                        ${node.color} text-white
                        ${isHovered || isSelected ? 'scale-110' : 'scale-100'}
                        ${isSelected ? 'ring-4 ring-blue-300' : ''}
                      `}>
                        {node.icon}
                      </div>

                      {/* Node Label */}
                      <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 text-center">
                        <div className="font-semibold text-sm text-gray-800">
                          {node.title}
                        </div>
                        <div className="font-bold text-lg text-gray-900">
                          {formatCurrency(node.value)}
                        </div>
                      </div>

                      {/* Flow Indicators */}
                      {!isCenter && (
                        <div className="absolute inset-0 pointer-events-none">
                          {node.category === 'income' && (
                            <ArrowRight className="absolute -right-8 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                          )}
                          {node.category === 'expenses' && (
                            <ArrowLeft className="absolute -left-8 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <div className="max-w-xs">
                      <div className="font-semibold mb-2">{node.title} Breakdown</div>
                      {node.details.map((detail, index) => (
                        <div key={index} className="flex justify-between items-center text-sm mb-1">
                          <span>{detail.label}:</span>
                          <span className="font-medium ml-2">
                            {detail.label.toLowerCase().includes('ratio') 
                              ? `${detail.value.toFixed(1)}%`
                              : formatCurrency(detail.value)
                            }
                          </span>
                        </div>
                      ))}
                      {node.details.some(d => d.description) && (
                        <div className="text-xs text-gray-400 mt-2 border-t pt-1">
                          {node.details.find(d => d.description)?.description}
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}

          {/* Legend */}
          <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-md p-3">
            <div className="text-xs font-semibold mb-2 text-gray-700">Categories</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Income</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Expenses</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Assets</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Liabilities</span>
              </div>
            </div>
          </div>

          {/* Financial Health Indicators */}
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md p-3">
            <div className="text-xs font-semibold mb-2 text-gray-700">Key Ratios</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Savings Rate:</span>
                <span className="font-medium">
                  {grossIncome > 0 ? formatPercentage(grossIncome - totalExpenses, grossIncome) : "0%"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax Rate:</span>
                <span className="font-medium">
                  {grossIncome > 0 ? formatPercentage(taxesPaid, grossIncome) : "0%"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Asset Growth:</span>
                <span className={`font-medium ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {netWorth >= 0 ? '+' : ''}{formatCurrency(netWorth)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed View Panel */}
        {selectedNode && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">
                {nodes.find(n => n.id === selectedNode)?.title} Details
              </h3>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nodes.find(n => n.id === selectedNode)?.details.map((detail, index) => (
                <div key={index} className="bg-white p-3 rounded border">
                  <div className="text-sm text-gray-600">{detail.label}</div>
                  <div className="text-xl font-bold text-gray-900">
                    {detail.label.toLowerCase().includes('ratio') 
                      ? `${detail.value.toFixed(1)}%`
                      : formatCurrency(detail.value)
                    }
                  </div>
                  {detail.description && (
                    <div className="text-xs text-gray-500 mt-1">{detail.description}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}