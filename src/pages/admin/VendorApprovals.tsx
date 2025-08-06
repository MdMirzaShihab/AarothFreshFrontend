import React, { useState, useMemo } from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  FileText,
  Building,
  MapPin,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  SearchBar,
  Table,
  Pagination,
  EmptyState,
  LoadingSpinner,
  ConfirmDialog,
  Modal,
  FormField,
  Input
} from '@/components/ui';
import { 
  useVendorApprovals, 
  useVendorApproval,
  useApproveVendor, 
  useRejectVendor 
} from '@/hooks/admin/useAdminQueries';
import { VendorApprovalRequest, VendorDocument } from '@/types/admin';
import { cn } from '@/utils/cn';

const StatusBadge: React.FC<{ status: VendorApprovalRequest['status'] }> = ({ status }) => {
  const variants = {
    pending: 'bg-amber-100 text-amber-800',
    approved: 'bg-mint-fresh/20 text-bottle-green',
    rejected: 'bg-tomato-red/20 text-tomato-red'
  };

  const icons = {
    pending: Clock,
    approved: CheckCircle,
    rejected: XCircle
  };

  const Icon = icons[status];

  return (
    <div className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', variants[status])}>
      <Icon className="w-3 h-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </div>
  );
};

const DocumentViewer: React.FC<{ 
  documents: VendorDocument[];
  onDownload?: (document: VendorDocument) => void;
}> = ({ documents, onDownload }) => {
  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'business_license':
        return <Building className="w-4 h-4" />;
      case 'tax_certificate':
        return <FileText className="w-4 h-4" />;
      case 'identity_proof':
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getDocumentLabel = (type: string) => {
    switch (type) {
      case 'business_license':
        return 'Business License';
      case 'tax_certificate':
        return 'Tax Certificate';
      case 'identity_proof':
        return 'Identity Proof';
      default:
        return 'Other Document';
    }
  };

  if (!documents.length) {
    return (
      <div className="text-center py-8 text-text-muted">
        <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No documents uploaded</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-bottle-green/10 rounded-lg text-bottle-green">
              {getDocumentIcon(doc.type)}
            </div>
            <div>
              <p className="font-medium text-text-dark text-sm">{getDocumentLabel(doc.type)}</p>
              <p className="text-xs text-text-muted">{doc.fileName}</p>
              <p className="text-xs text-text-muted">
                Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Eye className="w-3 h-3" />}
              onClick={() => window.open(doc.fileUrl, '_blank')}
            >
              View
            </Button>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Download className="w-3 h-3" />}
              onClick={() => onDownload?.(doc)}
            >
              Download
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

const ApprovalActions: React.FC<{
  approval: VendorApprovalRequest;
  onApprove: () => void;
  onReject: () => void;
  loading?: boolean;
}> = ({ approval, onApprove, onReject, loading }) => {
  if (approval.status !== 'pending') {
    return (
      <div className="space-y-3">
        <div className={cn(
          'p-4 rounded-xl border-2',
          approval.status === 'approved' 
            ? 'bg-mint-fresh/10 border-mint-fresh/30 text-bottle-green'
            : 'bg-tomato-red/10 border-tomato-red/30 text-tomato-red'
        )}>
          <div className="flex items-center gap-2 mb-2">
            {approval.status === 'approved' ? 
              <CheckCircle className="w-5 h-5" /> : 
              <XCircle className="w-5 h-5" />
            }
            <span className="font-semibold">
              Application {approval.status === 'approved' ? 'Approved' : 'Rejected'}
            </span>
          </div>
          {approval.reviewedAt && (
            <p className="text-sm opacity-80">
              Reviewed on {new Date(approval.reviewedAt).toLocaleDateString()}
            </p>
          )}
          {approval.reviewedBy && (
            <p className="text-sm opacity-80">
              By: {approval.reviewedBy}
            </p>
          )}
          {approval.rejectionReason && (
            <p className="text-sm mt-2 font-medium">
              Reason: {approval.rejectionReason}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <Button
        variant="primary"
        leftIcon={<CheckCircle className="w-4 h-4" />}
        onClick={onApprove}
        disabled={loading}
        className="flex-1"
      >
        Approve Vendor
      </Button>
      <Button
        variant="danger"
        leftIcon={<XCircle className="w-4 h-4" />}
        onClick={onReject}
        disabled={loading}
        className="flex-1"
      >
        Reject Application
      </Button>
    </div>
  );
};

export const VendorApprovals: React.FC = () => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApproval, setSelectedApproval] = useState<VendorApprovalRequest | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');

  // Query parameters
  const queryParams = useMemo(() => ({
    page: currentPage,
    limit: 20,
    search: searchQuery.trim() || undefined,
    status: statusFilter || undefined
  }), [currentPage, searchQuery, statusFilter]);

  // API hooks
  const { data: approvalsData, isLoading, error, refetch } = useVendorApprovals(queryParams);
  const approveVendorMutation = useApproveVendor();
  const rejectVendorMutation = useRejectVendor();

  // Table columns
  const columns = [
    {
      key: 'vendor',
      header: 'Vendor Information',
      render: (_: any, approval: VendorApprovalRequest) => (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-secondary rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {approval.user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium text-text-dark">{approval.user.name}</p>
              <p className="text-sm text-text-muted">{approval.user.phone}</p>
            </div>
          </div>
          <div className="ml-13">
            <p className="text-sm font-medium text-text-dark">{approval.businessName}</p>
            <p className="text-xs text-text-muted">{approval.businessType}</p>
          </div>
        </div>
      )
    },
    {
      key: 'business',
      header: 'Business Details',
      render: (_: any, approval: VendorApprovalRequest) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Building className="w-3 h-3 text-text-muted" />
            <span className="text-text-muted">{approval.businessType}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-3 h-3 text-text-muted" />
            <span className="text-text-muted text-xs">{approval.businessAddress}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FileText className="w-3 h-3 text-text-muted" />
            <span className="text-text-muted">{approval.documents.length} documents</span>
          </div>
        </div>
      )
    },
    {
      key: 'submitted',
      header: 'Submitted',
      render: (_: any, approval: VendorApprovalRequest) => (
        <div className="text-sm">
          <p className="text-text-dark">
            {new Date(approval.submittedAt).toLocaleDateString()}
          </p>
          <p className="text-text-muted text-xs">
            {new Date(approval.submittedAt).toLocaleTimeString()}
          </p>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (_: any, approval: VendorApprovalRequest) => (
        <StatusBadge status={approval.status} />
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '150px',
      render: (_: any, approval: VendorApprovalRequest) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Eye className="w-3 h-3" />}
            onClick={() => {
              setSelectedApproval(approval);
              setShowApprovalModal(true);
            }}
          >
            Review
          </Button>
        </div>
      )
    }
  ];

  const handleApprove = () => {
    if (!selectedApproval) return;

    approveVendorMutation.mutate({
      approvalId: selectedApproval.id,
      notes: approvalNotes.trim() || undefined
    }, {
      onSuccess: () => {
        setShowApprovalModal(false);
        setSelectedApproval(null);
        setApprovalNotes('');
      }
    });
  };

  const handleReject = () => {
    if (!selectedApproval || !rejectionReason.trim()) return;

    rejectVendorMutation.mutate({
      approvalId: selectedApproval.id,
      reason: rejectionReason.trim()
    }, {
      onSuccess: () => {
        setShowRejectModal(false);
        setShowApprovalModal(false);
        setSelectedApproval(null);
        setRejectionReason('');
      }
    });
  };

  const handleDocumentDownload = (document: VendorDocument) => {
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = document.fileUrl;
    link.download = document.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Statistics
  const stats = useMemo(() => {
    if (!approvalsData) return { pending: 0, approved: 0, rejected: 0 };
    
    return {
      pending: approvalsData.items.filter(a => a.status === 'pending').length,
      approved: approvalsData.items.filter(a => a.status === 'approved').length,
      rejected: approvalsData.items.filter(a => a.status === 'rejected').length
    };
  }, [approvalsData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-dark mb-2">Vendor Approvals</h1>
          <p className="text-text-muted">Review and approve vendor registration applications</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={() => refetch()}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted mb-2">Pending Review</p>
              <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-xl">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted mb-2">Approved</p>
              <p className="text-3xl font-bold text-bottle-green">{stats.approved}</p>
            </div>
            <div className="p-3 bg-mint-fresh/20 rounded-xl">
              <CheckCircle className="w-6 h-6 text-bottle-green" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted mb-2">Rejected</p>
              <p className="text-3xl font-bold text-tomato-red">{stats.rejected}</p>
            </div>
            <div className="p-3 bg-tomato-red/20 rounded-xl">
              <XCircle className="w-6 h-6 text-tomato-red" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            <div className="flex-1 max-w-md">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by vendor name, business name..."
                debounceMs={500}
              />
            </div>

            <div className="flex items-center gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-bottle-green/20"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              {(statusFilter || searchQuery) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setStatusFilter('');
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approvals Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="p-8">
              <EmptyState
                title="Failed to load approvals"
                description="There was an error loading the vendor approvals. Please try again."
                action={
                  <Button onClick={() => refetch()}>
                    Try Again
                  </Button>
                }
              />
            </div>
          ) : !approvalsData?.items.length ? (
            <div className="p-8">
              <EmptyState
                icon={<Clock className="w-12 h-12" />}
                title="No vendor applications"
                description="No vendor applications match your current criteria."
                action={
                  searchQuery || statusFilter ? (
                    <Button onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('');
                    }}>
                      Clear Filters
                    </Button>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-gray-100">
                <span className="text-sm text-text-muted">
                  {approvalsData.items.length} application(s) • Page {currentPage} of {approvalsData.totalPages}
                </span>
              </div>

              <Table
                data={approvalsData.items}
                columns={columns}
                onRowClick={(approval) => {
                  setSelectedApproval(approval);
                  setShowApprovalModal(true);
                }}
                hoverable
                className="border-0"
              />

              {approvalsData.totalPages > 1 && (
                <div className="p-6 border-t border-gray-100">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={approvalsData.totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={approvalsData.total}
                    itemsPerPage={20}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Approval Details Modal */}
      <Modal
        isOpen={showApprovalModal}
        onClose={() => {
          setShowApprovalModal(false);
          setSelectedApproval(null);
          setApprovalNotes('');
        }}
        title="Vendor Application Review"
        size="xl"
      >
        {selectedApproval && (
          <div className="space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Vendor Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-text-dark mb-4">Vendor Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {selectedApproval.user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-text-dark">{selectedApproval.user.name}</p>
                      <p className="text-sm text-text-muted">ID: {selectedApproval.user.id}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-text-muted" />
                      <span>{selectedApproval.user.phone}</span>
                    </div>
                    {selectedApproval.user.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-text-muted" />
                        <span>{selectedApproval.user.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-text-muted" />
                      <span>Joined: {new Date(selectedApproval.user.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-text-dark mb-4">Business Information</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <label className="font-medium text-text-dark">Business Name:</label>
                    <p className="text-text-muted">{selectedApproval.businessName}</p>
                  </div>
                  <div>
                    <label className="font-medium text-text-dark">Business Type:</label>
                    <p className="text-text-muted">{selectedApproval.businessType}</p>
                  </div>
                  <div>
                    <label className="font-medium text-text-dark">Address:</label>
                    <p className="text-text-muted">{selectedApproval.businessAddress}</p>
                  </div>
                  <div>
                    <label className="font-medium text-text-dark">Application Status:</label>
                    <div className="mt-1">
                      <StatusBadge status={selectedApproval.status} />
                    </div>
                  </div>
                  <div>
                    <label className="font-medium text-text-dark">Submitted:</label>
                    <p className="text-text-muted">
                      {new Date(selectedApproval.submittedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div>
              <h3 className="text-lg font-semibold text-text-dark mb-4">Supporting Documents</h3>
              <DocumentViewer 
                documents={selectedApproval.documents}
                onDownload={handleDocumentDownload}
              />
            </div>

            {/* Approval Notes (for approved/rejected) */}
            {selectedApproval.status === 'pending' && (
              <div>
                <FormField label="Review Notes (Optional)">
                  <Input
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    placeholder="Add any notes about this approval..."
                    multiline
                    rows={3}
                  />
                </FormField>
              </div>
            )}

            {/* Actions */}
            <div className="border-t border-gray-100 pt-6">
              <ApprovalActions
                approval={selectedApproval}
                onApprove={handleApprove}
                onReject={() => setShowRejectModal(true)}
                loading={approveVendorMutation.isPending}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Rejection Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectionReason('');
        }}
        title="Reject Vendor Application"
        size="md"
      >
        <div className="space-y-6">
          <div className="flex items-start gap-3 p-4 bg-tomato-red/10 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-tomato-red mt-0.5" />
            <div>
              <p className="font-medium text-tomato-red mb-1">Confirm Rejection</p>
              <p className="text-sm text-tomato-red/80">
                This will permanently reject the vendor application. The vendor will be notified of the rejection.
              </p>
            </div>
          </div>

          <FormField label="Rejection Reason" required>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide a clear reason for rejection..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20 resize-none"
              required
            />
          </FormField>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectModal(false);
                setRejectionReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleReject}
              disabled={!rejectionReason.trim() || rejectVendorMutation.isPending}
              loading={rejectVendorMutation.isPending}
            >
              Reject Application
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VendorApprovals;