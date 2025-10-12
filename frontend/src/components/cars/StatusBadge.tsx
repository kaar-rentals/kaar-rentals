import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Shield, Crown, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'available' | 'rented' | 'pending' | 'approved' | 'rejected' | 'verified' | 'featured' | 'premium';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const StatusBadge = ({ 
  status, 
  size = 'md', 
  showIcon = true, 
  className = '' 
}: StatusBadgeProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'available':
        return {
          label: 'Available',
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          iconColor: 'text-green-600'
        };
      case 'rented':
        return {
          label: 'Rented',
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
          iconColor: 'text-red-600'
        };
      case 'pending':
        return {
          label: 'Pending',
          variant: 'secondary' as const,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock,
          iconColor: 'text-yellow-600'
        };
      case 'approved':
        return {
          label: 'Approved',
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          iconColor: 'text-green-600'
        };
      case 'rejected':
        return {
          label: 'Rejected',
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
          iconColor: 'text-red-600'
        };
      case 'verified':
        return {
          label: 'Verified',
          variant: 'outline' as const,
          className: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Shield,
          iconColor: 'text-blue-600'
        };
      case 'featured':
        return {
          label: 'Featured',
          variant: 'outline' as const,
          className: 'bg-amber-100 text-amber-800 border-amber-200',
          icon: Crown,
          iconColor: 'text-amber-600'
        };
      case 'premium':
        return {
          label: 'Premium',
          variant: 'outline' as const,
          className: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: Crown,
          iconColor: 'text-purple-600'
        };
      default:
        return {
          label: 'Unknown',
          variant: 'secondary' as const,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: AlertCircle,
          iconColor: 'text-gray-600'
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-1';
      case 'md':
        return 'text-sm px-3 py-1.5';
      case 'lg':
        return 'text-base px-4 py-2';
      default:
        return 'text-sm px-3 py-1.5';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'h-3 w-3';
      case 'md':
        return 'h-4 w-4';
      case 'lg':
        return 'h-5 w-5';
      default:
        return 'h-4 w-4';
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant}
      className={`${config.className} ${getSizeClasses()} ${className} flex items-center gap-1`}
    >
      {showIcon && (
        <Icon className={`${getIconSize()} ${config.iconColor}`} />
      )}
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
