import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTickets } from '@/contexts/TicketContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { TicketCategory, TicketPriority } from '@/types/ticket';
import { 
  ArrowLeft, 
  FileText, 
  Loader2, 
  Upload, 
  X, 
  PlusCircle,
  AlertCircle,
  CheckCircle,
  Paperclip,
  Sparkles,
  Zap,
  Shield,
  MessageSquare,
  Rocket,
  Target,
  Clock,
  Users,
  Star,
  Palette,
  TrendingUp
} from 'lucide-react';

export default function NewTicketPage() {
  const navigate = useNavigate();
  const { createTicket } = useTickets();
  const { user } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TicketCategory | ''>('');
  const [priority, setPriority] = useState<TicketPriority>('Medium');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select a file smaller than 10MB',
          variant: 'destructive',
        });
        return;
      }
      setAttachment(file);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category) {
      toast({
        title: 'Category required',
        description: 'Please select a category for your ticket',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('priority', priority);
      
      if (attachment) {
        formData.append('attachment', attachment);
      }

      const result = await createTicket(formData);

      if (result.success) {
        toast({
          title: '✨ Ticket Created!',
          description: 'Your support ticket has been submitted successfully.',
          className: 'bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0',
        });
        navigate('/tickets');
      } else {
        toast({
          title: '❌ Error',
          description: result.error || 'Failed to create ticket',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const priorityColors = {
    Low: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700',
    Medium: 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700',
    High: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700',
    Urgent: 'bg-red-500/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700',
  };

  const priorityIcons = {
    Low: <TrendingUp className="h-4 w-4" />,
    Medium: <Clock className="h-4 w-4" />,
    High: <AlertCircle className="h-4 w-4" />,
    Urgent: <Zap className="h-4 w-4" />,
  };

  const categoryIcons = {
    Technical: <Zap className="h-5 w-5" />,
    Financial: <Shield className="h-5 w-5" />,
    Product: <Palette className="h-5 w-5" />,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5 dark:from-gray-900 dark:via-gray-900 dark:to-primary/10 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Modern Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/tickets')}
              className="gap-2 group hover:bg-primary/10 transition-all duration-300 rounded-full px-4 py-2"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Dashboard</span>
            </Button>
            
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-gradient-to-r from-primary/20 to-primary/10">
                <Rocket className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-primary">Quick Support</span>
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 to-purple-500/30 rounded-full blur-xl opacity-70 animate-pulse"></div>
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-2xl shadow-primary/30">
                  <PlusCircle className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl font-display font-bold text-foreground mb-3 bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
              Create New Support Request
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Fill in the details below and our team will assist you promptly
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form Card */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Steps */}
            <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              {['Details', 'Category', 'Priority', 'Review'].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className={`flex items-center justify-center h-10 w-10 rounded-full ${index < 2 ? 'bg-gradient-to-r from-primary to-primary/80 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                    {index + 1}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">Step {index + 1}</p>
                    <p className="text-xs text-muted-foreground">{step}</p>
                  </div>
                  {index < 3 && (
                    <div className="h-0.5 w-8 bg-gray-200 dark:bg-gray-700 mx-4"></div>
                  )}
                </div>
              ))}
            </div>

            <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500"></div>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-display font-bold flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5">
                        <MessageSquare className="h-6 w-6 text-primary" />
                      </div>
                      <span>Ticket Information</span>
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Provide clear details for faster resolution
                    </CardDescription>
                  </div>
                  <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${priorityColors[priority]}`}>
                    {priorityIcons[priority]}
                    <span className="font-semibold">{priority} Priority</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Title */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="title" className="text-base font-semibold flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        Issue Title *
                      </Label>
                      <span className="text-sm text-muted-foreground">
                        {title.length}/100
                      </span>
                    </div>
                    <div className="relative group">
                      <Input
                        id="title"
                        placeholder="Brief, descriptive title of your issue..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        maxLength={100}
                        className="pl-12 h-14 rounded-xl text-lg border-2 border-gray-200 dark:border-gray-700 focus:border-primary transition-all duration-300 hover:border-primary/50"
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </div>

                  {/* Category & Priority */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Category */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold flex items-center gap-2">
                        <Palette className="h-5 w-5 text-primary" />
                        Category *
                      </Label>
                      <div className="grid grid-cols-3 gap-3">
                        {Object.entries(categoryIcons).map(([cat, icon]) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setCategory(cat as TicketCategory)}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 ${
                              category === cat
                                ? 'border-primary bg-primary/10 shadow-lg scale-105'
                                : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:bg-primary/5'
                            }`}
                          >
                            <div className={`p-3 rounded-lg mb-2 ${category === cat ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                              {icon}
                            </div>
                            <span className="font-medium text-sm">{cat}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Priority */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary" />
                        Priority Level
                      </Label>
                      <div className="grid grid-cols-4 gap-3">
                        {Object.entries(priorityIcons).map(([prio, icon]) => (
                          <button
                            key={prio}
                            type="button"
                            onClick={() => setPriority(prio as TicketPriority)}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 ${
                              priority === prio
                                ? `${priorityColors[prio as TicketPriority]} shadow-lg scale-105`
                                : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:bg-primary/5'
                            }`}
                          >
                            <div className={`p-2 rounded-full mb-2 ${priority === prio ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                              {icon}
                            </div>
                            <span className="font-medium text-sm">{prio}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="description" className="text-base font-semibold flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Detailed Description *
                      </Label>
                      <span className="text-sm text-muted-foreground">
                        {description.length}/1000
                      </span>
                    </div>
                    <div className="relative group">
                      <Textarea
                        id="description"
                        placeholder="Please provide as much detail as possible:\n• What were you trying to do?\n• What happened?\n• What did you expect to happen?\n• Steps to reproduce the issue..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        rows={8}
                        maxLength={1000}
                        className="resize-none rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-primary transition-all duration-300 text-lg p-6 min-h-[200px]"
                      />
                      <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 px-3 py-1.5 rounded-full">
                        <Sparkles className="h-4 w-4 text-primary" />
                        
                      </div>
                    </div>
                  </div>

                  {/* Attachment */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <Paperclip className="h-5 w-5 text-primary" />
                      Attachments (Optional)
                    </Label>
                    {attachment ? (
                      <div className="p-5 rounded-xl border-2 border-emerald-200 dark:border-emerald-700 bg-gradient-to-r from-emerald-50 to-emerald-50/50 dark:from-emerald-900/20 dark:to-emerald-900/10 animate-scale-in">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-emerald-500/20">
                              <FileText className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate text-foreground">
                                {attachment.name}
                              </p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-muted-foreground">
                                  {(attachment.size / 1024).toFixed(1)} KB
                                </span>
                                <span className="h-1 w-1 rounded-full bg-muted-foreground"></span>
                                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                  ✓ Ready to upload
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={removeAttachment}
                            className="shrink-0 hover:bg-red-500/10 hover:text-red-600 transition-colors rounded-full"
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative group">
                        <input
                          type="file"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif"
                        />
                        <div className="p-8 rounded-xl border-3 border-dashed border-gray-300 dark:border-gray-600 bg-gradient-to-b from-gray-50/50 to-gray-50/30 dark:from-gray-800/30 dark:to-gray-800/10 group-hover:border-primary/50 group-hover:bg-primary/5 transition-all duration-500">
                          <div className="text-center">
                            <div className="inline-flex items-center justify-center p-4 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 mb-4 group-hover:scale-110 transition-transform duration-300">
                              <Upload className="h-8 w-8 text-primary" />
                            </div>
                            <p className="text-lg font-semibold text-foreground mb-2">
                              Drop files here or click to browse
                            </p>
                            <p className="text-sm text-muted-foreground mb-4">
                              Supports images, documents, spreadsheets • Max 10MB
                            </p>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                              <Star className="h-4 w-4 text-amber-500" />
                              <span className="text-sm font-medium">Recommended for faster resolution</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-100 dark:border-gray-700">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/tickets')}
                      className="flex-1 h-14 rounded-xl border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group"
                    >
                      <span className="font-semibold">Cancel</span>
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 h-14 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-white shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                          <span className="font-semibold">Creating Ticket...</span>
                        </>
                      ) : (
                        <>
                          <div className="mr-3 p-1.5 rounded-lg bg-white/20">
                            <CheckCircle className="h-5 w-5" />
                          </div>
                          <div className="text-left">
                            <p className="font-semibold text-lg">Submit Support Request</p>
                            <p className="text-sm text-white/80">Get help from our expert team</p>
                          </div>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Profile Card */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/10 via-primary/5 to-primary/20 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="absolute -inset-2 bg-gradient-to-r from-primary to-purple-500 rounded-full blur-md opacity-50"></div>
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-white text-xl font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{user?.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/20">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Support Team</p>
                        <p className="text-xs text-muted-foreground">Online now</p>
                      </div>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  </div>
                  <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-blue-500/5 border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        Expected Response
                      </span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${priorityColors[priority]}`}>
                        {priority}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-foreground mb-1">
                      {priority === 'Urgent' ? '< 2 hours' : 
                       priority === 'High' ? '< 4 hours' : 
                       priority === 'Medium' ? '< 24 hours' : '< 48 hours'}
                    </div>
                    <div className="h-2 bg-blue-200 dark:bg-blue-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${
                        priority === 'Urgent' ? 'bg-red-500' :
                        priority === 'High' ? 'bg-amber-500' :
                        priority === 'Medium' ? 'bg-blue-500' : 'bg-emerald-500'
                      }`} style={{
                        width: priority === 'Urgent' ? '90%' :
                               priority === 'High' ? '70%' :
                               priority === 'Medium' ? '50%' : '30%'
                      }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-amber-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-500/20">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="text-lg font-bold">Pro Tips</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary/80 text-white text-xs font-bold shrink-0">
                      1
                    </div>
                    <p className="text-sm font-medium">Include screenshots for visual issues</p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary/80 text-white text-xs font-bold shrink-0">
                      2
                    </div>
                    <p className="text-sm font-medium">Be specific with error messages</p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary/80 text-white text-xs font-bold shrink-0">
                      3
                    </div>
                    <p className="text-sm font-medium">Select correct priority for faster help</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
           
          </div>
        </div>

        {/* Floating Help */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            variant="default" 
            className="rounded-full shadow-2xl shadow-primary/30 bg-gradient-to-r from-primary to-primary/80 hover:shadow-3xl transition-all duration-300 h-14 w-14"
            onClick={() => toast({
              title: "Need Help?",
              description: "Contact support@tickethub.com",
            })}
          >
            <span className="text-2xl">?</span>
          </Button>
        </div>
      </div>
    </div>
  );
}