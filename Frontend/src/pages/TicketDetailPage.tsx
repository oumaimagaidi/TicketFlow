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
  File,
  AlertCircle,
  Trash2,
  MessageSquare,
  CheckCircle,
  Tag,
  Shield,
  BarChart3,
  Zap,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const API_URL = 'http://localhost:8000/api/auth';

const fixCloudinaryUrl = (url: string | undefined): string | undefined => {
  if (!url) return undefined;

  let cleanUrl = url.trim();

  // Si l'URL commence déjà par http, la retourner telle quelle
  if (cleanUrl.startsWith('http')) return cleanUrl;

  // Si c'est un chemin local (API Django), utiliser l'API locale
  if (cleanUrl.startsWith('/')) {
    return `http://localhost:8000${cleanUrl}`;
  }

  // Pour Cloudinary, reconstruire l'URL complète
  const cloudinaryBase = 'https://res.cloudinary.com/drbbqusyr';
  
  // Si le chemin Cloudinary ne commence pas par /, l'ajouter
  if (!cleanUrl.startsWith('/')) {
    cleanUrl = '/' + cleanUrl;
  }

  // Identifier le type de fichier par l'extension
  const extension = cleanUrl.split('.').pop()?.toLowerCase();
  
  // Pour les PDFs, utiliser le chemin raw/upload
  if (extension === 'pdf') {
    if (cleanUrl.includes('/raw/upload/')) {
      return `${cloudinaryBase}${cleanUrl}`;
    } else if (cleanUrl.includes('/raw/')) {
      cleanUrl = cleanUrl.replace('/raw/', '/raw/upload/');
      return `${cloudinaryBase}${cleanUrl}`;
    } else {
      // Si pas de chemin spécifique, utiliser raw/upload par défaut pour les PDF
      return `${cloudinaryBase}/raw/upload${cleanUrl}`;
    }
  }

  // Pour les images, utiliser image/upload
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(extension || '')) {
    if (cleanUrl.includes('/image/upload/')) {
      return `${cloudinaryBase}${cleanUrl}`;
    } else if (cleanUrl.includes('/image/')) {
      cleanUrl = cleanUrl.replace('/image/', '/image/upload/');
      return `${cloudinaryBase}${cleanUrl}`;
    } else {
      // Si pas de chemin spécifique, utiliser image/upload par défaut pour les images
      return `${cloudinaryBase}/image/upload${cleanUrl}`;
    }
  }

  // Pour les autres fichiers, essayer de déterminer le chemin
  if (cleanUrl.includes('/image/') || cleanUrl.includes('/video/') || cleanUrl.includes('/raw/')) {
    return `${cloudinaryBase}${cleanUrl}`;
  }

  // Par défaut, utiliser image/upload (le plus commun pour Cloudinary)
  return `${cloudinaryBase}/image/upload${cleanUrl}`;
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
    case 'image': return <Image className="h-10 w-10 text-blue-500" />;
    case 'pdf': return <FileText className="h-10 w-10 text-red-500" />;
    case 'word': return <FileText className="h-10 w-10 text-blue-600" />;
    case 'excel': return <FileText className="h-10 w-10 text-green-600" />;
    case 'text': return <FileText className="h-10 w-10 text-gray-600" />;
    case 'archive': return <File className="h-10 w-10 text-yellow-600" />;
    default: return <File className="h-10 w-10 text-gray-500" />;
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
  const [imageError, setImageError] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const loadTicket = async () => {
      setLoading(true);
      setImageError(false);

      const localTicket = getTicketById(Number(id));

      if (localTicket) {
        setTicket(localTicket);

        if (user?.name && localTicket.createdByName) {
          setIsOwner(localTicket.createdByName === user.name);
        }

        setLoading(false);
      } else {
        await fetchTickets();
        const refreshedTicket = getTicketById(Number(id));
        if (refreshedTicket) {
          setTicket(refreshedTicket);

          if (user?.name && refreshedTicket.createdByName) {
            setIsOwner(refreshedTicket.createdByName === user.name);
          }
        } else {
          setTicket(null);
        }
        setLoading(false);
      }
    };

    if (id) {
      loadTicket();
    }
  }, [id, getTicketById, fetchTickets, user]);

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!ticket) return;

    const result = await updateTicketStatus(ticket.id, newStatus);

    if (result.success) {
      toast({
        title: '✅ Status Updated',
        description: `Ticket status changed to "${newStatus}"`,
        className: 'bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0',
      });
      await fetchTickets();
    } else {
      toast({
        title: '❌ Error',
        description: result.error || 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  // FONCTIONS DE TÉLÉCHARGEMENT CORRIGÉES
  const handleOpenAttachment = () => {
    if (!ticket?.attachment) return;

    const viewUrl = fixCloudinaryUrl(ticket.attachment);
    
    if (!viewUrl) return;

    // Toujours ouvrir dans un nouvel onglet
    window.open(viewUrl, '_blank');
  };

const handleDownloadAttachment = () => {
  if (!ticket?.attachment) return;
  
  let downloadUrl = fixCloudinaryUrl(ticket.attachment);
  
  if (!downloadUrl) return;
  
  const fileType = getFileType(ticket.attachmentName);
  const isPDF = fileType === 'pdf';
  
  // Créer un lien de téléchargement
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = ticket.attachmentName || 'attachment';
  
  // Pour Cloudinary PDFs, ajouter le paramètre fl_attachment pour forcer le téléchargement
  if (downloadUrl.includes('cloudinary.com') && isPDF) {
    if (!downloadUrl.includes('fl_attachment')) {
      if (downloadUrl.includes('/upload/')) {
        downloadUrl = downloadUrl.replace('/upload/', '/upload/fl_attachment/');
      }
      link.href = downloadUrl;
    }
  }
  
  // Ajouter un timeout pour gérer les échecs de téléchargement
  const timeoutId = setTimeout(() => {
    toast({
      title: '⚠️ Download may have failed',
      description: 'Try clicking "Open" to view the file instead.',
      variant: 'destructive',
    });
  }, 5000);
  
  link.onclick = () => {
    clearTimeout(timeoutId);
  };
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Nettoyer le timeout après le clic
  setTimeout(() => {
    clearTimeout(timeoutId);
  }, 100);
  
  toast({
    title: '📥 Download Started',
    description: `Downloading ${ticket.attachmentName || 'file'}...`,
  });
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
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = ticket.attachmentName || 'attachment';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast({
          title: '📥 Download Started',
          description: 'Your file download has started',
        });
      } else {
        // Fallback to direct download
        handleDownloadAttachment();
      }
    } catch (error) {
      console.error('API download error:', error);
      handleDownloadAttachment();
    } finally {
      setDownloading(false);
    }
  };

  const handleDeleteTicket = async () => {
    if (!ticket) return;
    
    if (!window.confirm(`Are you sure you want to delete ticket #${ticket.id}? This action cannot be undone.`)) {
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/tickets/${ticket.id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: '🗑️ Ticket Deleted',
          description: `Ticket #${ticket.id} has been deleted successfully.`,
        });
        navigate('/tickets');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete ticket');
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: '❌ Delete Failed',
        description: error.message || 'Failed to delete ticket',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 to-purple-500/30 rounded-full blur-xl opacity-70 animate-pulse"></div>
          <div className="relative">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          </div>
        </div>
        <p className="mt-4 text-lg font-medium text-foreground">Loading ticket details...</p>
        <p className="text-sm text-muted-foreground">Fetching your information</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-white p-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-r from-red-500/10 to-red-500/5 mb-6">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-3xl font-display font-bold text-foreground mb-3">Ticket Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The ticket you're looking for doesn't exist or has been removed.
          </p>
          <Button 
            onClick={() => navigate('/tickets')}
            className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:shadow-xl transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tickets
          </Button>
        </div>
      </div>
    );
  }

  const correctedAttachmentUrl = fixCloudinaryUrl(ticket.attachment);
  const fileType = getFileType(ticket.attachmentName);
  const isImage = fileType === 'image';
  const isPDF = fileType === 'pdf';
  // CORRECTION : Autoriser les propriétaires à télécharger leurs fichiers
  const canUserAccess = isAdmin || isOwner;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/tickets')}
              className="gap-2 group hover:bg-primary/10 transition-all duration-300 rounded-full px-4 py-3"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Dashboard</span>
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="absolute -inset-3 bg-gradient-to-r from-primary/30 to-purple-500/30 rounded-full blur-md opacity-60"></div>
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-xl shadow-primary/20">
                    <MessageSquare className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-display font-bold text-foreground">
                    {ticket.title}
                  </h1>
                  <div className="flex items-center flex-wrap gap-2 mt-2">
                    <Badge variant="outline" className="text-sm font-medium bg-primary/10 text-primary">
                      #{ticket.id}
                    </Badge>
                    <TicketCategoryBadge category={ticket.category} />
                    <TicketStatusBadge status={ticket.status} />
                    {isOwner && (
                      <Badge variant="secondary" className="text-xs">
                        <User className="h-3 w-3 mr-1" />
                        Your Ticket
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {(isAdmin || (isOwner && ticket.status === 'New')) && (
                <Button
                  variant="destructive"
                  onClick={handleDeleteTicket}
                  className="gap-2 rounded-full px-6 hover:shadow-lg transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Ticket
                </Button>
              )}
              
              {isAdmin && (
                <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Status:</span>
                  </div>
                  <Select value={ticket.status} onValueChange={(v) => handleStatusChange(v as TicketStatus)}>
                    <SelectTrigger className="w-[180px] border-0 bg-transparent focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-0 shadow-xl">
                      <SelectItem value="New" className="rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                          New
                        </div>
                      </SelectItem>
                      <SelectItem value="Under Review" className="rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                          Under Review
                        </div>
                      </SelectItem>
                      <SelectItem value="Resolved" className="rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          Resolved
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Details Card */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500"></div>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-display flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <span>Ticket Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Meta Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/5 to-blue-500/2 border border-blue-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Created By</p>
                        <p className="text-lg font-semibold text-foreground flex items-center gap-2">
                          {ticket.createdByName}
                          {isOwner && (
                            <Badge variant="secondary" className="text-xs px-2 py-0">
                              You
                            </Badge>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/5 to-amber-500/2 border border-amber-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/10">
                        <Calendar className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Created At</p>
                        <p className="text-lg font-semibold text-foreground">
                          {format(new Date(ticket.createdAt), 'PPP')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(ticket.createdAt), 'p')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">Description</h3>
                  </div>
                  <div className="p-6 rounded-xl bg-gradient-to-br from-gray-50 to-gray-50/50 border border-gray-100">
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {ticket.description}
                    </p>
                  </div>
                </div>

                {/* Attachment Section - CORRIGÉ */}
                {correctedAttachmentUrl && canUserAccess && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <Paperclip className="h-5 w-5" />
                      Attachment
                    </h3>
                    <div className="border rounded-xl overflow-hidden">
                      {isImage ? (
                        <div className="bg-muted/50 p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              {getFileIcon(ticket.attachmentName)}
                              <div>
                                <p className="text-sm font-medium">{ticket.attachmentName || 'Unnamed file'}</p>
                                <p className="text-xs text-muted-foreground">
                                  {fileType.toUpperCase()} • Click to view
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleOpenAttachment}
                                className="gap-2 rounded-full"
                              >
                                <Eye className="h-4 w-4" />
                                View
                              </Button>
                              {/* Téléchargement autorisé pour admin ET propriétaire */}
                              <Button
                                size="sm"
                                onClick={handleDownloadAttachment}
                                disabled={downloading}
                                className="gap-2 rounded-full bg-gradient-to-r from-primary to-primary/80"
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
                          {!imageError ? (
                            <img
                              src={correctedAttachmentUrl}
                              alt="Attachment preview"
                              className="max-w-full max-h-[400px] rounded-lg object-contain mx-auto border shadow-sm"
                              onError={() => setImageError(true)}
                              onLoad={() => setImageError(false)}
                            />
                          ) : (
                            <div className="text-center py-8 bg-gradient-to-br from-red-500/5 to-red-500/2 rounded-lg">
                              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-2" />
                              <p className="text-red-500 font-medium">Failed to load image preview</p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-3 gap-2"
                                onClick={handleOpenAttachment}
                              >
                                <ExternalLink className="h-4 w-4" />
                                Open Image Directly
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-4 bg-gradient-to-br from-primary/5 to-primary/2">
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
                              onClick={handleOpenAttachment}
                              className="gap-2 rounded-full"
                              title={isPDF ? "Open PDF in browser" : "Open file in browser"}
                            >
                              <ExternalLink className="h-4 w-4" />
                              Open
                            </Button>

                            {/* Téléchargement autorisé pour admin ET propriétaire */}
                            <Button
                              size="sm"
                              onClick={handleDownloadAttachment}
                              disabled={downloading}
                              className="gap-2 rounded-full bg-gradient-to-r from-primary to-primary/80"
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
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {isImage ? (
                        'Click "View" to see full image or "Download" to save it.'
                      ) : isPDF ? (
                        'Click "Open" to view PDF or "Download" to save it.'
                      ) : (
                        'Click "Open" to view file or "Download" to save it.'
                      )}
                    </div>
                  </div>
                )}

                {/* Message si pas d'accès */}
                {correctedAttachmentUrl && !canUserAccess && (
                  <div className="p-4 border rounded-xl bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-200">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-yellow-800 font-medium">Access Restricted</p>
                        <p className="text-yellow-700 text-sm mt-1">
                          You can only view attachments from your own tickets.
                        </p>
                        <div className="text-yellow-700 text-xs mt-2 space-y-1">
                          <div><strong>Ticket owner:</strong> {ticket.createdByName}</div>
                          <div><strong>Your username:</strong> {user?.name}</div>
                          <div><strong>Status:</strong> {isOwner ? 'You own this ticket' : 'This is not your ticket'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Message si pas d'attachement */}
                {!ticket.attachment && (
                  <div className="p-4 border rounded-xl bg-gradient-to-br from-gray-50 to-gray-50/50">
                    <p className="text-gray-600 text-sm flex items-center gap-2">
                      <File className="h-4 w-4" />
                      No attachment for this ticket
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status History */}
            {ticket.statusHistory && ticket.statusHistory.length > 0 && (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500"></div>
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
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            history.status === 'Resolved' ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white' :
                            history.status === 'Under Review' ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white' :
                            'bg-gradient-to-r from-primary to-blue-500 text-white'
                          }`}>
                            {history.status === 'Resolved' ? <CheckCircle className="h-4 w-4" /> :
                             history.status === 'Under Review' ? <Clock className="h-4 w-4" /> :
                             <Tag className="h-4 w-4" />}
                          </div>
                          {index < ticket.statusHistory.length - 1 && (
                            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-gradient-to-b from-primary/30 to-transparent" />
                          )}
                        </div>
                        <div className="flex-1 -mt-0.5">
                          <div className="flex items-center gap-2 mb-2">
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500"></div>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <span className="text-sm text-muted-foreground">Time Open</span>
                  <span className="font-bold text-foreground">
                    {Math.floor((new Date().getTime() - new Date(ticket.createdAt).getTime()) / (1000 * 60 * 60 * 24))}d
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <span className="text-sm text-muted-foreground">Status Changes</span>
                  <span className="font-bold text-primary">{ticket.statusHistory?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <span className="text-sm text-muted-foreground">Attachment</span>
                  <span className={`font-bold ${ticket.attachment ? 'text-emerald-600' : 'text-gray-500'}`}>
                    {ticket.attachment ? '✓ Present' : '✗ None'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* User Info */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500"></div>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  User Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-white font-bold text-lg">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{user?.name || 'Unknown User'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email || 'No email'}</p>
                    {isOwner && (
                      <Badge variant="secondary" className="text-xs mt-1 px-2 py-0">
                        Ticket Owner
                      </Badge>
                    )}
                  </div>
                </div>
                {isAdmin && (
                  <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-200">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-700">
                        Admin Access
                      </span>
                    </div>
                    <p className="text-xs text-emerald-600/80 mt-1">
                      You have full administrative privileges
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500"></div>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {correctedAttachmentUrl && canUserAccess && (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleOpenAttachment}
                      className="w-full justify-start gap-2 h-11 rounded-lg"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {isImage ? 'View Image' : 'Open File'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleDownloadAttachment}
                      disabled={downloading}
                      className="w-full justify-start gap-2 h-11 rounded-lg"
                    >
                      {downloading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      Download File
                    </Button>
                  </>
                )}
                
                <Button
                  variant="outline"
                  onClick={() => navigate('/tickets')}
                  className="w-full justify-start gap-2 h-11 rounded-lg"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Tickets
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

