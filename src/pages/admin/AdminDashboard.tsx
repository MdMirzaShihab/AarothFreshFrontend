import React from 'react';
import {
  Users,
  Store,
  ChefHat,
  ShoppingBag,
  Clock,
  DollarSign,
  Activity,
  UserCheck,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  LoadingSpinner,
  EmptyState,
  Button
} from '@/components/ui';
import { useAdminDashboardMetrics, useAdminRecentActivities } from '@/hooks/admin/useAdminQueries';
import { cn } from '@/utils/cn';

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'yellow';
  loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color, 
  loading 
}) => {
  const colorStyles = {
    blue: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    green: 'bg-mint-fresh/10 text-bottle-green border-mint-fresh/20',
    orange: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    purple: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    red: 'bg-tomato-red/10 text-tomato-red border-tomato-red/20',
    yellow: 'bg-amber-500/10 text-amber-600 border-amber-500/20'
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-earthy-beige rounded w-1/2"></div>
            <div className="w-8 h-8 bg-earthy-beige rounded"></div>
          </div>
          <div className="h-8 bg-earthy-beige rounded w-1/3"></div>
          <div className="h-3 bg-earthy-beige rounded w-1/4"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-text-muted">{title}</p>
        <div className={cn('p-2 rounded-xl border', colorStyles[color])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div className="space-y-2">
        <p className="text-3xl font-bold text-text-dark">{value.toLocaleString()}</p>
        
        {trend && (
          <div className="flex items-center gap-1">
            <TrendingUp className={cn(
              'w-4 h-4',
              trend.isPositive ? 'text-mint-fresh' : 'text-tomato-red',
              !trend.isPositive && 'rotate-180'
            )} />
            <span className={cn(
              'text-sm font-medium',
              trend.isPositive ? 'text-mint-fresh' : 'text-tomato-red'
            )}>
              {trend.value}% from last month
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  color: string;
  disabled?: boolean;
}

const QuickAction: React.FC<QuickActionProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  onClick, 
  color, 
  disabled 
}) => (
  <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={onClick}>
    <div className="flex items-start gap-4">
      <div className={cn('p-3 rounded-xl group-hover:scale-110 transition-transform duration-200', color)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-text-dark mb-1">{title}</h3>
        <p className="text-sm text-text-muted leading-relaxed">{description}</p>
      </div>
    </div>
  </Card>
);

export const AdminDashboard: React.FC = () => {
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useAdminDashboardMetrics();
  const { data: activities, isLoading: activitiesLoading } = useAdminRecentActivities(5);

  const handleQuickAction = (action: string) => {
    // Navigate to respective pages
    console.log('Quick action:', action);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-dark mb-2">Admin Dashboard</h1>
        <p className="text-text-muted">Overview of your platform's performance and key metrics</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={metrics?.totalUsers || 0}
          icon={Users}
          color="blue"
          loading={metricsLoading}
          trend={{ value: 12, isPositive: true }}
        />
        <MetricCard
          title="Active Vendors"
          value={metrics?.totalVendors || 0}
          icon={Store}
          color="green"
          loading={metricsLoading}
          trend={{ value: 8, isPositive: true }}
        />
        <MetricCard
          title="Restaurants"
          value={metrics?.totalRestaurants || 0}
          icon={ChefHat}
          color="orange"
          loading={metricsLoading}
          trend={{ value: 5, isPositive: true }}
        />
        <MetricCard
          title="Total Orders"
          value={metrics?.totalOrders || 0}
          icon={ShoppingBag}
          color="purple"
          loading={metricsLoading}
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Pending Approvals"
          value={metrics?.pendingApprovals || 0}
          icon={Clock}
          color="yellow"
          loading={metricsLoading}
        />
        <MetricCard
          title="Monthly Revenue"
          value={`৳${(metrics?.monthlyRevenue || 0).toLocaleString()}`}
          icon={DollarSign}
          color="green"
          loading={metricsLoading}
          trend={{ value: 22, isPositive: true }}
        />
        <MetricCard
          title="Active Users"
          value={metrics?.activeUsers || 0}
          icon={Activity}
          color="blue"
          loading={metricsLoading}
        />
        <MetricCard
          title="Recent Signups"
          value={metrics?.recentSignups || 0}
          icon={UserCheck}
          color="purple"
          loading={metricsLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <QuickAction
                title="Review Vendor Applications"
                description="Approve or reject pending vendor registrations"
                icon={Store}
                color="bg-bottle-green"
                onClick={() => handleQuickAction('vendor-approvals')}
              />
              <QuickAction
                title="Manage Users"
                description="View and manage user accounts and permissions"
                icon={Users}
                color="bg-blue-500"
                onClick={() => handleQuickAction('user-management')}
              />
              <QuickAction
                title="Product Oversight"
                description="Monitor and manage product listings"
                icon={ShoppingBag}
                color="bg-orange-500"
                onClick={() => handleQuickAction('products')}
              />
              <QuickAction
                title="View Analytics"
                description="Detailed insights and performance metrics"
                icon={TrendingUp}
                color="bg-purple-500"
                onClick={() => handleQuickAction('analytics')}
              />
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              {activitiesLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center gap-4">
                      <div className="w-8 h-8 bg-earthy-beige rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-earthy-beige rounded w-3/4"></div>
                        <div className="h-3 bg-earthy-beige rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : activities?.length ? (
                <div className="space-y-4">
                  {activities.map((activity: any, index: number) => (
                    <div key={index} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-b-0">
                      <div className="w-8 h-8 bg-bottle-green/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Activity className="w-4 h-4 text-bottle-green" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-dark">
                          {activity.description || 'New activity'}
                        </p>
                        <p className="text-xs text-text-muted mt-1">
                          {new Date(activity.createdAt || Date.now()).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<AlertCircle className="w-12 h-12" />}
                  title="No recent activities"
                  description="Recent platform activities will appear here"
                  size="sm"
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Error State */}
      {metricsError && (
        <Card className="p-6">
          <div className="text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-tomato-red mx-auto" />
            <div>
              <h3 className="font-semibold text-text-dark mb-2">Failed to load dashboard data</h3>
              <p className="text-text-muted mb-4">There was an error loading the dashboard metrics.</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;