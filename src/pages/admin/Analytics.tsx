import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Store,
  ShoppingBag,
  DollarSign,
  Calendar,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  LoadingSpinner,
  EmptyState
} from '@/components/ui';
import { useAdminAnalytics } from '@/hooks/admin/useAdminQueries';
import { cn } from '@/utils/cn';

interface MetricCardProps {
  title: string;
  value: string | number;
  change: {
    value: number;
    isPositive: boolean;
    period: string;
  };
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color 
}) => (
  <Card className="p-6 hover:shadow-lg transition-all duration-300">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-medium text-text-muted">{title}</h3>
      <div className={cn('p-2 rounded-xl', color)}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    
    <div className="space-y-2">
      <p className="text-3xl font-bold text-text-dark">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      
      <div className="flex items-center gap-1">
        {change.isPositive ? (
          <TrendingUp className="w-4 h-4 text-mint-fresh" />
        ) : (
          <TrendingDown className="w-4 h-4 text-tomato-red" />
        )}
        <span className={cn(
          'text-sm font-medium',
          change.isPositive ? 'text-mint-fresh' : 'text-tomato-red'
        )}>
          {change.isPositive ? '+' : ''}{change.value}%
        </span>
        <span className="text-sm text-text-muted">vs {change.period}</span>
      </div>
    </div>
  </Card>
);

interface SimpleChartProps {
  title: string;
  data: Array<{ period: string; value: number }>;
  type: 'line' | 'bar';
  color: string;
}

const SimpleChart: React.FC<SimpleChartProps> = ({ title, data, color }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-20 text-sm text-text-muted">
                {item.period}
              </div>
              <div className="flex-1 relative">
                <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={cn('h-full rounded-full transition-all duration-500', color)}
                    style={{ width: `${(item.value / maxValue) * 100}%` }}
                  />
                </div>
                <span className="absolute right-2 top-0 text-sm font-medium text-text-dark">
                  {item.value.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

interface TopListProps {
  title: string;
  items: Array<{
    id: string;
    name: string;
    value: number;
    change?: number;
  }>;
  valuePrefix?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TopList: React.FC<TopListProps> = ({ title, items, valuePrefix = '', icon: Icon }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Icon className="w-5 h-5" />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={item.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-secondary rounded-full flex items-center justify-center text-white font-medium text-sm">
                {index + 1}
              </div>
              <div>
                <p className="font-medium text-text-dark">{item.name}</p>
                {item.change && (
                  <div className="flex items-center gap-1">
                    {item.change > 0 ? (
                      <TrendingUp className="w-3 h-3 text-mint-fresh" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-tomato-red" />
                    )}
                    <span className={cn(
                      'text-xs',
                      item.change > 0 ? 'text-mint-fresh' : 'text-tomato-red'
                    )}>
                      {item.change > 0 ? '+' : ''}{item.change}%
                    </span>
                  </div>
                )}
              </div>
            </div>
            <span className="font-semibold text-text-dark">
              {valuePrefix}{item.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export const Analytics: React.FC = () => {
  const [timePeriod, setTimePeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  
  const { data: analyticsData, isLoading, error, refetch } = useAdminAnalytics({
    period: timePeriod
  });

  // Mock data for demonstration (replace with real data from API)
  const mockMetrics = {
    totalRevenue: { value: '৳2,45,000', change: { value: 15.3, isPositive: true, period: 'last month' }},
    totalOrders: { value: 1247, change: { value: 8.2, isPositive: true, period: 'last month' }},
    totalUsers: { value: 5642, change: { value: 12.5, isPositive: true, period: 'last month' }},
    avgOrderValue: { value: '৳196', change: { value: -2.1, isPositive: false, period: 'last month' }}
  };

  const mockUserGrowth = [
    { period: 'Jan', value: 450 },
    { period: 'Feb', value: 520 },
    { period: 'Mar', value: 610 },
    { period: 'Apr', value: 580 },
    { period: 'May', value: 720 },
    { period: 'Jun', value: 850 }
  ];

  const mockRevenueGrowth = [
    { period: 'Jan', value: 185000 },
    { period: 'Feb', value: 205000 },
    { period: 'Mar', value: 225000 },
    { period: 'Apr', value: 210000 },
    { period: 'May', value: 235000 },
    { period: 'Jun', value: 245000 }
  ];

  const mockTopCategories = [
    { id: '1', name: 'Fresh Vegetables', value: 45600, change: 12.5 },
    { id: '2', name: 'Fruits', value: 38200, change: 8.3 },
    { id: '3', name: 'Leafy Greens', value: 29800, change: -2.1 },
    { id: '4', name: 'Root Vegetables', value: 24500, change: 15.7 },
    { id: '5', name: 'Herbs & Spices', value: 18900, change: 6.2 }
  ];

  const mockTopVendors = [
    { id: '1', name: 'Green Valley Farms', value: 125000, change: 18.5 },
    { id: '2', name: 'Fresh Harvest Co.', value: 98000, change: 12.3 },
    { id: '3', name: 'Organic Fields Ltd.', value: 87000, change: -5.2 },
    { id: '4', name: 'Sunny Farms', value: 76000, change: 25.1 },
    { id: '5', name: 'Local Harvest', value: 69000, change: 8.7 }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8">
            <EmptyState
              title="Failed to load analytics"
              description="There was an error loading the analytics data. Please try again."
              action={
                <Button onClick={() => refetch()}>
                  Try Again
                </Button>
              }
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-dark mb-2">Analytics Dashboard</h1>
          <p className="text-text-muted">Comprehensive insights into platform performance</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Time Period Selector */}
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value as any)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bottle-green/20"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          
          <Button
            variant="outline"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={() => refetch()}
          >
            Refresh
          </Button>
          
          <Button
            variant="outline"
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={mockMetrics.totalRevenue.value}
          change={mockMetrics.totalRevenue.change}
          icon={DollarSign}
          color="bg-mint-fresh/20 text-bottle-green"
        />
        <MetricCard
          title="Total Orders"
          value={mockMetrics.totalOrders.value}
          change={mockMetrics.totalOrders.change}
          icon={ShoppingBag}
          color="bg-blue-500/20 text-blue-600"
        />
        <MetricCard
          title="Total Users"
          value={mockMetrics.totalUsers.value}
          change={mockMetrics.totalUsers.change}
          icon={Users}
          color="bg-purple-500/20 text-purple-600"
        />
        <MetricCard
          title="Avg Order Value"
          value={mockMetrics.avgOrderValue.value}
          change={mockMetrics.avgOrderValue.change}
          icon={Activity}
          color="bg-orange-500/20 text-orange-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleChart
          title="User Growth"
          data={mockUserGrowth}
          type="bar"
          color="bg-purple-500"
        />
        <SimpleChart
          title="Revenue Trend"
          data={mockRevenueGrowth}
          type="line"
          color="bg-bottle-green"
        />
      </div>

      {/* Top Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopList
          title="Top Categories"
          items={mockTopCategories}
          valuePrefix="৳"
          icon={PieChart}
        />
        <TopList
          title="Top Vendors"
          items={mockTopVendors}
          valuePrefix="৳"
          icon={Store}
        />
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text-dark">Order Completion Rate</h3>
            <div className="p-2 bg-mint-fresh/20 rounded-lg">
              <TrendingUp className="w-4 h-4 text-bottle-green" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-bottle-green mb-2">94.5%</p>
            <p className="text-sm text-text-muted">+2.3% from last month</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text-dark">Customer Satisfaction</h3>
            <div className="p-2 bg-amber-100 rounded-lg">
              <Activity className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-amber-600 mb-2">4.7/5</p>
            <p className="text-sm text-text-muted">Based on 1,247 reviews</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text-dark">Active Vendors</h3>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Store className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600 mb-2">156</p>
            <p className="text-sm text-text-muted">+8 new this month</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;