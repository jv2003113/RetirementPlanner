import { apiRequest } from "./queryClient";

// Types for financial security data
export interface Security {
  ticker: string;
  name: string;
  assetClass: 'stock' | 'bond' | 'cash' | 'real_estate' | 'other';
  region: 'domestic' | 'international' | 'emerging' | 'global';
  sectors: {
    [sector: string]: number; // Sector name to percentage allocation
  };
  allocation: {
    stocks: number;
    bonds: number;
    cash: number;
    other: number;
  };
}

export interface SecurityHolding {
  id?: number;
  accountId: number;
  ticker: string;
  percentage: number;
  securityData?: Security;
}

// Cache for security data to avoid repeated API calls
const securityCache: Record<string, Security> = {};

// For demo purposes, we'll use a mock implementation
// In a real app, you would replace this with an actual API call to a service like Alpha Vantage, Yahoo Finance, or IEX Cloud
export async function fetchSecurityData(ticker: string): Promise<Security> {
  // Check cache first
  if (securityCache[ticker]) {
    return securityCache[ticker];
  }
  
  // In a real implementation, you'd make an API call here
  // return await apiRequest(`/api/securities/${ticker}`);
  
  // For now, we'll use mock data based on the ticker
  const mockData = getMockSecurityData(ticker);
  
  // Cache the result
  securityCache[ticker] = mockData;
  
  return mockData;
}

// Helper function to get mock data
function getMockSecurityData(ticker: string): Security {
  const upperTicker = ticker.toUpperCase();
  
  // Predefined securities with realistic data
  const predefinedSecurities: Record<string, Security> = {
    'VTI': {
      ticker: 'VTI',
      name: 'Vanguard Total Stock Market ETF',
      assetClass: 'stock',
      region: 'domestic',
      sectors: {
        'Technology': 28.5,
        'Healthcare': 13.2,
        'Financial Services': 12.8,
        'Consumer Cyclical': 10.5,
        'Industrials': 9.7,
        'Communication Services': 8.3,
        'Consumer Defensive': 6.5,
        'Utilities': 2.4,
        'Energy': 2.8,
        'Real Estate': 3.1,
        'Basic Materials': 2.2
      },
      allocation: {
        stocks: 99.5,
        bonds: 0,
        cash: 0.5,
        other: 0
      }
    },
    'VXUS': {
      ticker: 'VXUS',
      name: 'Vanguard Total International Stock ETF',
      assetClass: 'stock',
      region: 'international',
      sectors: {
        'Financial Services': 19.2,
        'Industrials': 15.8,
        'Technology': 13.5,
        'Consumer Cyclical': 11.2,
        'Healthcare': 9.4,
        'Consumer Defensive': 8.6,
        'Basic Materials': 7.5,
        'Communication Services': 6.1,
        'Energy': 4.5,
        'Utilities': 3.2,
        'Real Estate': 1.0
      },
      allocation: {
        stocks: 99.2,
        bonds: 0,
        cash: 0.8,
        other: 0
      }
    },
    'BND': {
      ticker: 'BND',
      name: 'Vanguard Total Bond Market ETF',
      assetClass: 'bond',
      region: 'domestic',
      sectors: {
        'Government': 42.5,
        'Corporate': 27.8,
        'Securitized': 29.7
      },
      allocation: {
        stocks: 0,
        bonds: 99.1,
        cash: 0.9,
        other: 0
      }
    },
    'BNDX': {
      ticker: 'BNDX',
      name: 'Vanguard Total International Bond ETF',
      assetClass: 'bond',
      region: 'international',
      sectors: {
        'Government': 65.3,
        'Corporate': 20.5,
        'Securitized': 14.2
      },
      allocation: {
        stocks: 0,
        bonds: 98.8,
        cash: 1.2,
        other: 0
      }
    },
    'VNQ': {
      ticker: 'VNQ',
      name: 'Vanguard Real Estate ETF',
      assetClass: 'real_estate',
      region: 'domestic',
      sectors: {
        'Real Estate': 100
      },
      allocation: {
        stocks: 0,
        bonds: 0,
        cash: 1.5,
        other: 98.5
      }
    },
    'VGSH': {
      ticker: 'VGSH',
      name: 'Vanguard Short-Term Treasury ETF',
      assetClass: 'bond',
      region: 'domestic',
      sectors: {
        'Government': 100
      },
      allocation: {
        stocks: 0,
        bonds: 98.5,
        cash: 1.5,
        other: 0
      }
    },
    'VOO': {
      ticker: 'VOO',
      name: 'Vanguard S&P 500 ETF',
      assetClass: 'stock',
      region: 'domestic',
      sectors: {
        'Technology': 29.7,
        'Healthcare': 13.1,
        'Financial Services': 12.9,
        'Consumer Cyclical': 10.3,
        'Communication Services': 8.6,
        'Industrials': 8.5,
        'Consumer Defensive': 6.8,
        'Energy': 4.1,
        'Utilities': 2.5,
        'Real Estate': 2.3,
        'Basic Materials': 1.2
      },
      allocation: {
        stocks: 99.7,
        bonds: 0,
        cash: 0.3,
        other: 0
      }
    },
    'VWCE': {
      ticker: 'VWCE',
      name: 'Vanguard FTSE All-World UCITS ETF',
      assetClass: 'stock',
      region: 'global',
      sectors: {
        'Technology': 23.8,
        'Financial Services': 15.7,
        'Healthcare': 12.5,
        'Consumer Cyclical': 10.8,
        'Industrials': 10.3,
        'Communication Services': 7.5,
        'Consumer Defensive': 7.2,
        'Energy': 4.8,
        'Basic Materials': 3.5,
        'Utilities': 2.9,
        'Real Estate': 1.0
      },
      allocation: {
        stocks: 99.0,
        bonds: 0,
        cash: 1.0,
        other: 0
      }
    },
    'VEA': {
      ticker: 'VEA',
      name: 'Vanguard Developed Markets ETF',
      assetClass: 'stock',
      region: 'international',
      sectors: {
        'Financial Services': 18.9,
        'Industrials': 16.2,
        'Technology': 11.8,
        'Consumer Cyclical': 11.5,
        'Healthcare': 10.1,
        'Consumer Defensive': 8.9,
        'Basic Materials': 7.3,
        'Communication Services': 5.2,
        'Energy': 4.1,
        'Utilities': 3.5,
        'Real Estate': 2.5
      },
      allocation: {
        stocks: 99.1,
        bonds: 0,
        cash: 0.9,
        other: 0
      }
    },
    'VWO': {
      ticker: 'VWO',
      name: 'Vanguard Emerging Markets ETF',
      assetClass: 'stock',
      region: 'emerging',
      sectors: {
        'Financial Services': 22.5,
        'Technology': 19.7,
        'Consumer Cyclical': 13.2,
        'Communication Services': 9.8,
        'Basic Materials': 8.5,
        'Industrials': 6.3,
        'Consumer Defensive': 6.2,
        'Energy': 5.8,
        'Healthcare': 3.9,
        'Utilities': 2.7,
        'Real Estate': 1.4
      },
      allocation: {
        stocks: 98.5,
        bonds: 0,
        cash: 1.5,
        other: 0
      }
    }
  };
  
  // Return predefined security if available
  if (predefinedSecurities[upperTicker]) {
    return predefinedSecurities[upperTicker];
  }
  
  // For unknown tickers, generate random data
  // In a real implementation, you'd return an error or fetch from an API
  return {
    ticker: upperTicker,
    name: `${upperTicker} Security`,
    assetClass: Math.random() > 0.6 ? 'stock' : 'bond',
    region: Math.random() > 0.5 ? 'domestic' : 'international',
    sectors: {
      'Technology': Math.random() * 30,
      'Financial Services': Math.random() * 20,
      'Healthcare': Math.random() * 15,
      'Consumer Cyclical': Math.random() * 10,
      'Industrials': Math.random() * 10,
      'Other': Math.random() * 15
    },
    allocation: {
      stocks: Math.random() > 0.6 ? 95 + Math.random() * 5 : Math.random() * 5,
      bonds: Math.random() > 0.6 ? (Math.random() > 0.5 ? 95 + Math.random() * 5 : Math.random() * 5) : Math.random() * 5,
      cash: Math.random() * 3,
      other: Math.random() * 2
    }
  };
}

// Calculate aggregate allocation from a list of security holdings
export function calculatePortfolioAllocation(holdings: SecurityHolding[]): {
  assetAllocation: { [key: string]: number },
  sectorAllocation: { [key: string]: number },
  regionAllocation: { [key: string]: number }
} {
  if (!holdings.length) {
    return {
      assetAllocation: { stocks: 0, bonds: 0, cash: 0, other: 0 },
      sectorAllocation: {},
      regionAllocation: { domestic: 0, international: 0, emerging: 0, global: 0 }
    };
  }
  
  const assetAllocation = { stocks: 0, bonds: 0, cash: 0, other: 0 };
  const sectorAllocation: { [key: string]: number } = {};
  const regionAllocation = { domestic: 0, international: 0, emerging: 0, global: 0 };
  
  const totalPercentage = holdings.reduce((sum, holding) => sum + holding.percentage, 0);
  
  holdings.forEach(holding => {
    if (!holding.securityData) return;
    
    const weightFactor = holding.percentage / totalPercentage;
    
    // Asset allocation
    Object.entries(holding.securityData.allocation).forEach(([asset, percentage]) => {
      const assetKey = asset as keyof typeof assetAllocation;
      assetAllocation[assetKey] += (percentage * weightFactor) / 100;
    });
    
    // Sector allocation
    Object.entries(holding.securityData.sectors).forEach(([sector, percentage]) => {
      if (!sectorAllocation[sector]) {
        sectorAllocation[sector] = 0;
      }
      sectorAllocation[sector] += (percentage * weightFactor) / 100;
    });
    
    // Region allocation
    regionAllocation[holding.securityData.region] += weightFactor;
  });
  
  return { assetAllocation, sectorAllocation, regionAllocation };
}