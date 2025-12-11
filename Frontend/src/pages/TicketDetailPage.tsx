import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTickets } from '@/contexts/TicketContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TicketStatusBadge } from '@/components/tickets/TicketStatusBadge';
import { TicketCategoryBadge } from '@/components/tickets/TicketCategoryBadge';
import { useToast } from '@/hooks/use-toast';
import { Ticket, TicketStatus } from '@/types/ticket';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Paperclip, 
  Clock,
  Download,
  FileText,
  Image,
  Loader2,
  Eye,
  ExternalLink,
  File
} from 'lucide-react';
import { format } from 'date-fns';

const API_URL = 'http://localhost:8000/api/auth';

const fixCloudinaryUrl = (url: string | undefined): string | undefined => {
  if (!url) return undefined;
  
  if (url.startsWith('http')) return url;
  
  if (url.startsWith('/image/upload/') || url.startsWith('/video/upload/') || url.startsWith('/raw/upload/')) {
    return `https://res.cloudinary.com/drbbqusyr${url}`;
  }
  
  if (url.startsWith('/')) {
    return `http://localhost:8000${url}`;
  }
  
  return url;
};

const getFileType = (filename?: string): string => {
  if (!filename) return 'unknown';
  
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(extension)) {
    return 'image';
  } else if (['pdf'].includes(extension)) {
    return 'pdf';
  } else if (['doc', 'docx'].includes(extension)) {
    return 'word';
  } else if (['xls', 'xlsx'].includes(extension)) {
    return 'excel';
  } else if (['txt', 'md'].includes(extension)) {
    return 'text';
  } else if (['zip', 'rar', '7z'].includes(extension)) {
    return 'archive';
  } else {
    return 'file';
  }
};

const getFileIcon = (filename?: string) => {
  const type = getFileType(filename);
  
  switch (type) {
    case 'image': return <Image className="h-8 w-8 text-blue-500" />;
    case 'pdf': return <FileText className="h-8 w-8 text-red-500" />;
    case 'word': return <FileText className="h-8 w-8 text-blue-600" />;
    case 'excel': return <FileText className="h-8 w-8 text-green-600" />;
    case 'text': return <FileText className="h-8 w-8 text-gray-600" />;
    case 'archive': return <File className="h-8 w-8 text-yellow-600" />;
    default: return <File className="h-8 w-8 text-gray-500" />;
  }
};

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTicketById, updateTicketStatus, fetchTickets } = useTickets();
  const { isAdmin, user } = useAuth();
  const { toast } = useToast();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const loadTicket = async () => {
      setLoading(true);
      
      const localTicket = getTicketById(Number(id));
      
      if (localTicket) {
        setTicket(localTicket);
        setLoading(false);
      } else {
        await fetchTickets();
        const refreshedTicket = getTicketById(Number(id));
        setTicket(refreshedTicket || null);
        setLoading(false);
      }
    };

    if (id) {
      loadTicket();
    }
  }, [id, getTicketById, fetchTickets]);

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!ticket) return;

    const result = await updateTicketStatus(ticket.id, newStatus);
    
    if (result.success) {
      toast({
        title: 'Status updated',
        description: `Ticket status changed to "${newStatus}"`,
      });
      await fetchTickets();
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadAttachment = () => {
    if (!ticket?.attachment) return;
    
    let downloadUrl = fixCloudinaryUrl(ticket.attachment);
    
    if (!downloadUrl) return;
    
    const isPDF = ticket.attachmentName?.toLowerCase().endsWith('.pdf');
    const fileType = getFileType(ticket.attachmentName);
    
    if (fileType === 'pdf' || fileType === 'word' || fileType === 'excel' || fileType === 'archive') {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = ticket.attachmentName || 'attachment';
      
      if (downloadUrl.includes('cloudinary.com') && !downloadUrl.includes('fl_attachment')) {
        downloadUrl = downloadUrl.replace('/upload/', '/upload/fl_attachment/');
        link.href = downloadUrl;
      }
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(downloadUrl, '_blank');
    }
    
    toast({
      title: 'Download started',
      description: `Downloading ${ticket.attachmentName || 'file'}...`,
    });
  };

  const handleViewAttachment = () => {
    if (!ticket?.attachment) return;
    
    const viewUrl = fixCloudinaryUrl(ticket.attachment);
    
    if (viewUrl) {
      window.open(viewUrl, '_blank');
    }
  };

  const handleDownloadViaAPI = async () => {
    if (!ticket?.id) return;
    
    setDownloading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/tickets/${ticket.id}/download/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        const downloadUrl = response.url;
        window.open(downloadUrl, '_blank');
        
        toast({
          title: 'Download started',
          description: 'Your file download has started',
        });
      } else {
        handleDownloadAttachment();
      }
    } catch (error) {
      console.error('API download error:', error);
      handleDownloadAttachment();
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">Ticket not found</h2>
        <p className="text-muted-foreground mb-4">The ticket you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/tickets')}>Back to Tickets</Button>
      </div>
    );
  }


  const correctedAttachmentUrl = fixCloudinaryUrl(ticket.attachment);
  const fileType = getFileType(ticket.attachmentName);
  const isImage = fileType === 'image';
  const canUserAccess = isAdmin || ticket.createdBy === user?.id;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <Button
        variant="ghost"
        onClick={() => navigate('/tickets')}
        className="mb-6 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Tickets
      </Button>

      <div className="grid gap-6">
        {/* Main Ticket Info */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">#{ticket.id}</span>
                  <TicketCategoryBadge category={ticket.category} />
                  <TicketStatusBadge status={ticket.status} />
                </div>
                <CardTitle className="text-2xl font-display">{ticket.title}</CardTitle>
              </div>
              
              {isAdmin && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Select value={ticket.status} onValueChange={(v) => handleStatusChange(v as TicketStatus)}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Under Review">Under Review</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Meta Info */}
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Created by <strong className="text-foreground">{ticket.createdByName}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(ticket.createdAt), 'PPP \'at\' p')}</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Description</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>

            {/* Attachment */}
            {correctedAttachmentUrl && canUserAccess && (
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  Attachment
                </h3>
                <div className="border rounded-lg overflow-hidden">
                  {isImage ? (
                    <div className="bg-muted/50 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getFileIcon(ticket.attachmentName)}
                          <div>
                            <p className="text-sm font-medium">{ticket.attachmentName}</p>
                            <p className="text-xs text-muted-foreground">
                              {fileType.toUpperCase()} • Click to view or download
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleViewAttachment}
                            className="gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                          <Button 
                            size="sm"
                            onClick={handleDownloadAttachment}
                            disabled={downloading}
                            className="gap-2"
                          >
                            {downloading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                            Download
                          </Button>
                        </div>
                      </div>
                      <img 
                        src={correctedAttachmentUrl} 
                        alt="Attachment preview" 
                        className="max-w-full max-h-[400px] rounded-lg object-contain mx-auto border"
                        onError={(e) => {
                          console.error('Image failed to load:', correctedAttachmentUrl);
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            const errorDiv = document.createElement('div');
                            errorDiv.className = 'text-center py-4 text-red-500';
                            errorDiv.textContent = 'Failed to load image preview';
                            parent.appendChild(errorDiv);
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-muted/50">
                      <div className="flex items-center gap-3">
                        {getFileIcon(ticket.attachmentName)}
                        <div>
                          <p className="font-medium">{ticket.attachmentName || 'Attachment'}</p>
                          <p className="text-sm text-muted-foreground">
                            {fileType.toUpperCase()} file • {(ticket.attachmentName?.split('.').pop() || '').toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleViewAttachment}
                          className="gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Open
                        </Button>
                        <Button 
                          size="sm"
                          onClick={handleDownloadAttachment}
                          disabled={downloading}
                          className="gap-2"
                        >
                          {downloading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                          Download
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={handleDownloadViaAPI}
                          disabled={downloading}
                          title="Download via API (better for some file types)"
                          className="gap-2"
                        >
                          <File className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isImage ? 
                    'Click "View" to see full image or "Download" to save it.' : 
                    'Click "Open" to view in browser or "Download" to save to your device.'}
                </p>
              </div>
            )}

            {/* Message si pas d'accès */}
            {correctedAttachmentUrl && !canUserAccess && (
              <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> You don't have permission to access attachments from other users' tickets.
                  Only admins can view all attachments.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status History */}
        {ticket.statusHistory && ticket.statusHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Status History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {ticket.statusHistory.map((history, index) => (
                  <div key={index} className="flex gap-4 pb-6 last:pb-0">
                    <div className="relative flex flex-col items-center">
                      <div className={`h-3 w-3 rounded-full ${
                        history.status === 'Resolved' ? 'bg-green-500' :
                        history.status === 'Under Review' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`} />
                      {index < ticket.statusHistory.length - 1 && (
                        <div className="absolute top-3 w-0.5 h-full bg-border" />
                      )}
                    </div>
                    <div className="flex-1 -mt-0.5">
                      <div className="flex items-center gap-2">
                        <TicketStatusBadge status={history.status} />
                        <span className="text-sm text-muted-foreground">
                          by {history.changedBy}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(history.changedAt), 'PPP \'at\' p')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}