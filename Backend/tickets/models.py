from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from cloudinary.models import CloudinaryField
import cloudinary

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('user', 'User'),
    )
    
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    email = models.EmailField(unique=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def __str__(self):
        return f"{self.email} ({self.role})"
    
    def is_admin(self):
        return self.role == 'admin'
    
    class Meta:
        db_table = 'auth_user'

class Ticket(models.Model):
    # ============ CATÉGORIES ET STATUTS ============
    CATEGORY_CHOICES = [
        ('Technical', 'Technical'),
        ('Financial', 'Financial'),
        ('Product', 'Product'),
    ]
    
    STATUS_CHOICES = [
        ('New', 'New'),
        ('Under Review', 'Under Review'),
        ('Resolved', 'Resolved'),
    ]
    
    PRIORITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Urgent', 'Urgent'),
    ]
    
    # ============ CHAMPS PRINCIPAUX ============
    title = models.CharField(
        max_length=200,
        verbose_name="Title",
        help_text="Brief summary of the issue"
    )
    
    description = models.TextField(
        verbose_name="Description",
        help_text="Detailed description of the issue"
    )
    
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        verbose_name="Category"
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='New',
        verbose_name="Status"
    )
    
    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default='Medium',
        verbose_name="Priority"
    )
    
    # ============ ATTACHMENTS CLOUDINARY ============
    attachment = CloudinaryField(
        resource_type='auto',
        folder='ticket_attachments/',
        type='upload',
        null=True,
        blank=True, 
        verbose_name="Attachment File"
    )
    
    attachment_name = models.CharField(
        max_length=255,
        blank=True,
        verbose_name="Original File Name"
    )
    
    attachment_size = models.BigIntegerField(
        default=0,
        blank=True,
        verbose_name="File Size (bytes)"
    )
    
    # ============ RELATIONS ET TIMESTAMPS ============
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='tickets_created',
        verbose_name="Created By"
    )
    
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tickets_assigned',
        verbose_name="Assigned To"
    )
    
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tickets_resolved',
        verbose_name="Resolved By"
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Created At"
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Last Updated"
    )
    
    resolved_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Resolved At"
    )
    
    due_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Due Date"
    )
    
    # ============ META ============
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Support Ticket'
        verbose_name_plural = 'Support Tickets'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['category']),
            models.Index(fields=['priority']),
            models.Index(fields=['created_by']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"#{self.id}: {self.title}"
    
    # ============ MÉTHODES POUR ATTACHMENTS ============
    def get_attachment_download_url(self):
        """Retourne l'URL de téléchargement Cloudinary avec flag d'attachement"""
        if not self.attachment:
            return None
        
        try:
            import cloudinary
            from cloudinary.utils import cloudinary_url
            
            public_id = self.attachment.public_id
            format = self.attachment.format
            
            if format == "pdf":
                resource_type = "raw"
            else:
                resource_type = self.attachment.resource_type or "image"
            
            url, options = cloudinary_url(
                public_id,
                format=format,
                resource_type=resource_type,
                flags=['attachment'],  
                type='upload'
            )
            
            return url
            
        except Exception as e:
            print(f"Error generating download URL: {e}")
            try:
                url = str(self.attachment.url)
                if 'cloudinary.com' in url and 'fl_attachment' not in url:
                    if '/upload/' in url:
                        url = url.replace('/upload/', '/upload/fl_attachment/')
                    elif '/image/' in url:
                        url = url.replace('/image/', '/image/upload/fl_attachment/')
                    elif '/raw/' in url:
                        url = url.replace('/raw/', '/raw/upload/fl_attachment/')
                return url
            except:
                return None
    
    def get_attachment_view_url(self):
        """URL pour visualiser le fichier (sans téléchargement forcé)"""
        if not self.attachment:
            return None
        return self.attachment.url
    
    # ============ MÉTHODES POUR ADMIN ============
    def assign_to_user(self, user):
        """Assigner le ticket à un utilisateur (admin seulement)"""
        if user.role == 'user' or user.role == 'admin':
            self.assigned_to = user
            self.save()
            return True
        return False
    
    def update_status(self, new_status, user=None):
        """Changer le statut (admin seulement pour certains statuts)"""
        old_status = self.status
        self.status = new_status
        
        if new_status == 'Resolved':
            self.resolved_at = models.DateTimeField(auto_now=True)
            if user:
                self.resolved_by = user
        
        self.save()
        return old_status, new_status
    
    def get_status_history(self):
        """Historique des statuts (à implémenter avec un modèle séparé si besoin)"""
        return [
            {'status': self.status, 'changed_at': self.updated_at}
        ]
    
    # ============ MÉTHODES POUR USER ============
    def can_user_view(self, user):
        """Vérifie si l'utilisateur peut voir ce ticket"""
        if user.role == 'admin':
            return True
        return self.created_by == user or self.assigned_to == user
    
    def can_user_edit(self, user):
        """Vérifie si l'utilisateur peut éditer ce ticket"""
        if user.role == 'admin':
            return True
        return self.created_by == user and self.status == 'New'
    
    def can_user_delete(self, user):
        """Vérifie si l'utilisateur peut supprimer ce ticket"""
        if user.role == 'admin':
            return True
        return self.created_by == user and self.status == 'New'
    
    # ============ MÉTHODES UTILITAIRES ============
    def get_attachment_url(self):
        """URL Cloudinary du fichier"""
        return self.attachment.url if self.attachment else None
    
    def get_file_info(self):
        """Informations sur le fichier attaché"""
        if not self.attachment:
            return None
        
        return {
            'name': self.attachment_name,
            'size': self.attachment_size,
            'url': self.get_attachment_url(),
            'download_url': self.get_attachment_download_url(),
            'view_url': self.get_attachment_view_url(),
            'type': self.get_file_type()
        }
    
    def get_file_type(self):
        """Type du fichier"""
        if not self.attachment_name:
            return None
        
        ext = self.attachment_name.split('.')[-1].lower()
        
        if ext in ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp']:
            return 'image'
        elif ext in ['pdf']:
            return 'pdf'
        elif ext in ['doc', 'docx']:
            return 'word'
        elif ext in ['xls', 'xlsx']:
            return 'excel'
        else:
            return 'other'
    
    def is_overdue(self):
        """Vérifie si le ticket est en retard"""
        if self.due_date and self.status != 'Resolved':
            from django.utils import timezone
            return timezone.now() > self.due_date
        return False
    
    def get_time_elapsed(self):
        """Temps écoulé depuis la création"""
        from django.utils import timezone
        from datetime import datetime
        
        now = timezone.now()
        delta = now - self.created_at
        
        if delta.days > 0:
            return f"{delta.days} days"
        elif delta.seconds // 3600 > 0:
            return f"{delta.seconds // 3600} hours"
        else:
            return f"{delta.seconds // 60} minutes"
    
    def to_dict(self, user=None):
        """Convertir en dictionnaire pour l'API"""
        data = {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'status': self.status,
            'priority': self.priority,
            'created_by': {
                'id': self.created_by.id,
                'email': self.created_by.email,
                'username': self.created_by.username,
                'role': self.created_by.role,
            },
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'attachment': self.get_file_info(),
            'can_edit': self.can_user_edit(user) if user else False,
            'can_delete': self.can_user_delete(user) if user else False,
            'time_elapsed': self.get_time_elapsed(),
            'is_overdue': self.is_overdue(),
        }
        
        if self.assigned_to:
            data['assigned_to'] = {
                'id': self.assigned_to.id,
                'email': self.assigned_to.email,
                'username': self.assigned_to.username,
            }
        
        if self.resolved_by:
            data['resolved_by'] = {
                'id': self.resolved_by.id,
                'email': self.resolved_by.email,
                'username': self.resolved_by.username,
            }
        
        if self.resolved_at:
            data['resolved_at'] = self.resolved_at.isoformat()
        
        if self.due_date:
            data['due_date'] = self.due_date.isoformat()
        
        return data

# ============ MODÈLE POUR HISTORIQUE DES STATUTS ============
class TicketStatusHistory(models.Model):
    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.CASCADE,
        related_name='status_history'
    )
    
    old_status = models.CharField(max_length=20)
    new_status = models.CharField(max_length=20)
    
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )
    
    changed_at = models.DateTimeField(auto_now_add=True)
    note = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-changed_at']
        verbose_name = 'Status History'
        verbose_name_plural = 'Status Histories'
    
    def __str__(self):
        return f"Ticket #{self.ticket.id}: {self.old_status} → {self.new_status}"