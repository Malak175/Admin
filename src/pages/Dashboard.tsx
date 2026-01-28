import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  UserPlus,
  Stethoscope,
  FlaskConical,
  Check,
  X,
  Clock,
  Mail,
  Phone,
  MessageSquare,
} from 'lucide-react';
import { demoMembershipRequests, MembershipRequest } from '@/services/api';
import { toast } from 'sonner';

// Filter out patient requests - only doctor and laboratory
const initialRequests = demoMembershipRequests.filter(r => r.type !== 'patient');

export default function Dashboard() {
  const [requests, setRequests] = useState<MembershipRequest[]>(initialRequests);
  const [selectedRequest, setSelectedRequest] = useState<MembershipRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const pendingDoctorRequests = requests.filter(r => r.status === 'pending' && r.type === 'doctor');
  const pendingLabRequests = requests.filter(r => r.status === 'pending' && r.type === 'laboratory');

  const stats = {
    total: pendingDoctorRequests.length + pendingLabRequests.length,
    doctors: pendingDoctorRequests.length,
    laboratories: pendingLabRequests.length,
  };

  const handleAction = (request: MembershipRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(action);
    setRejectionReason('');
  };

  const confirmAction = () => {
    if (!selectedRequest || !actionType) return;

    setRequests(prev =>
      prev.map(r =>
        r.id === selectedRequest.id
          ? { ...r, status: actionType === 'approve' ? 'approved' : 'rejected' }
          : r
      )
    );

    toast.success(
      actionType === 'approve'
        ? `${selectedRequest.name} has been approved successfully!`
        : `${selectedRequest.name} has been rejected.`
    );

    setSelectedRequest(null);
    setActionType(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderRequestCard = (request: MembershipRequest) => {
    const TypeIcon = request.type === 'doctor' ? Stethoscope : FlaskConical;
    const typeColor = request.type === 'doctor' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary';

    return (
      <div
        key={request.id}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-start gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${typeColor}`}>
            <TypeIcon className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{request.name}</h3>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                {request.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                {request.phone}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatDate(request.createdAt)}
              </span>
            </div>
            {request.specialty && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Specialty:</span> {request.specialty}
              </p>
            )}
            {request.licenseNumber && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">License:</span> {request.licenseNumber}
              </p>
            )}
            {request.facilityType && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Facility Type:</span> {request.facilityType.charAt(0).toUpperCase() + request.facilityType.slice(1)}
              </p>
            )}
            <p className="text-sm text-muted-foreground flex items-start gap-1 mt-1">
              <MessageSquare className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span className="line-clamp-2">{request.message}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 lg:shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => handleAction(request, 'reject')}
          >
            <X className="h-4 w-4 mr-1" />
            Reject
          </Button>
          <Button
            size="sm"
            className="bg-success hover:bg-success/90 text-success-foreground"
            onClick={() => handleAction(request, 'approve')}
          >
            <Check className="h-4 w-4 mr-1" />
            Approve
          </Button>
        </div>
      </div>
    );
  };

  const renderEmptyState = (type: string) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
        <Check className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-foreground">All caught up!</h3>
      <p className="text-sm text-muted-foreground mt-1">
        There are no pending {type} requests to review.
      </p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Membership Requests</h1>
        <p className="text-muted-foreground mt-1">
          Review and manage pending doctor and laboratory registration requests
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <UserPlus className="h-6 w-6 text-primary" />
              </div>
              <Badge variant="secondary" className="bg-warning/10 text-warning">
                Pending
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Requests</p>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card" style={{ animationDelay: '50ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10">
                <Stethoscope className="h-6 w-6 text-secondary" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-foreground">{stats.doctors}</p>
              <p className="text-sm text-muted-foreground">Doctor Requests</p>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <FlaskConical className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-foreground">{stats.laboratories}</p>
              <p className="text-sm text-muted-foreground">Laboratory Requests</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Doctor Requests Section */}
      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
            <Stethoscope className="h-5 w-5 text-secondary" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">Doctor Join Requests</CardTitle>
            <p className="text-sm text-muted-foreground">{pendingDoctorRequests.length} pending requests</p>
          </div>
        </CardHeader>
        <CardContent>
          {pendingDoctorRequests.length > 0 ? (
            <div className="space-y-4">
              {pendingDoctorRequests.map(renderRequestCard)}
            </div>
          ) : (
            renderEmptyState('doctor')
          )}
        </CardContent>
      </Card>

      {/* Laboratory Requests Section */}
      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <FlaskConical className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">Laboratory Join Requests</CardTitle>
            <p className="text-sm text-muted-foreground">{pendingLabRequests.length} pending requests</p>
          </div>
        </CardHeader>
        <CardContent>
          {pendingLabRequests.length > 0 ? (
            <div className="space-y-4">
              {pendingLabRequests.map(renderRequestCard)}
            </div>
          ) : (
            renderEmptyState('laboratory')
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={!!selectedRequest && !!actionType} onOpenChange={() => {
        setSelectedRequest(null);
        setActionType(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve'
                ? `Are you sure you want to approve ${selectedRequest?.name}'s registration request?`
                : `Are you sure you want to reject ${selectedRequest?.name}'s registration request?`}
            </DialogDescription>
          </DialogHeader>

          {actionType === 'reject' && (
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason (Optional)</Label>
              <Textarea
                id="reason"
                placeholder="Provide a reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedRequest(null);
                setActionType(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant={actionType === 'approve' ? 'default' : 'destructive'}
              onClick={confirmAction}
            >
              {actionType === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
