from django.db import models
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from rest_framework.views import APIView 
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser  
from django.http import HttpResponse, FileResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
import os
import mimetypes

from .models import Ticket, User
from .serializers import (
    UserSerializer,
    UserCreateSerializer,
    UserLoginSerializer,
    CustomTokenObtainPairSerializer,
    TicketSerializer,
    TicketCreateSerializer,
    TicketUpdateSerializer
)
from .permissions import IsAdminOrSelf, IsOwnerOrAdmin

User = get_user_model()

# ============ AUTHENTICATION VIEWS ============

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class CustomLoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response(
                {'error': 'Email and password required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'detail': 'No active account found with the given credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not user.check_password(password):
            return Response(
                {'detail': 'No active account found with the given credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not user.is_active:
            return Response(
                {'detail': 'Account is not active'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        refresh = RefreshToken.for_user(user)
        user_data = UserSerializer(user).data
        
        return Response({
            'user': user_data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
    def destroy(self, request, *args, **kwargs):
        ticket = self.get_object()
        
        # Vérifier les permissions
        if not (request.user.role == 'admin' or 
                (ticket.created_by == request.user and ticket.status == 'New')):
            return Response(
                {'error': 'You do not have permission to delete this ticket'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if ticket.attachment:
            try:
                import cloudinary.uploader
                cloudinary.uploader.destroy(ticket.attachment.public_id)
            except Exception as e:
                print(f"Error deleting Cloudinary file: {e}")
        
        # Supprimer le ticket
        self.perform_destroy(ticket)
        
        return Response(
            {'message': 'Ticket deleted successfully'},
            status=status.HTTP_200_OK
        )
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminOrSelf]
    
    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return super().get_permissions()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            
            user = authenticate(request, username=email, password=password)
            
            if user:
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': UserSerializer(user).data
                })
            
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def logout(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
                return Response({'message': 'Successfully logged out'})
            return Response(
                {'error': 'Refresh token required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserCreateSerializer

# ============ TICKET VIEWS ============

class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all().select_related('created_by')
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]  
    
    def get_queryset(self):
        user = self.request.user
        queryset = Ticket.objects.all().select_related('created_by')
        
        if user.role != 'admin':
            queryset = queryset.filter(created_by=user)
        
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                models.Q(title__icontains=search) | 
                models.Q(description__icontains=search)
            )
        
        # Tri
        ordering = self.request.query_params.get('ordering', '-created_at')
        if ordering:
            queryset = queryset.order_by(ordering)
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TicketCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return TicketUpdateSerializer
        return TicketSerializer
    
    def get_permissions(self):
        if self.action in ['retrieve', 'destroy']:
            return [IsOwnerOrAdmin()]
        elif self.action in ['update', 'partial_update']:
            return [IsAdminUser()]
        return [IsAuthenticated()]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        if 'attachment' in request.FILES:
            serializer.validated_data['attachment_name'] = request.FILES['attachment'].name
        
        serializer.validated_data['created_by'] = request.user
        
        self.perform_create(serializer)
        response_serializer = TicketSerializer(serializer.instance)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        ticket = self.get_object()
        
        if request.user.role != 'admin':
            return Response(
                {'error': 'Only admin can update ticket status'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = TicketUpdateSerializer(ticket, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(TicketSerializer(ticket).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def my_tickets(self, request):
        tickets = self.get_queryset().filter(created_by=request.user)
        serializer = self.get_serializer(tickets, many=True)
        return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_ticket_attachment(request, ticket_id):
    """Vue pour télécharger directement l'attachement d'un ticket"""
    try:
        ticket = Ticket.objects.get(id=ticket_id)
        
        if request.user.role != 'admin' and ticket.created_by != request.user:
            return Response(
                {'error': 'You do not have permission to access this ticket'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if not ticket.attachment:
            return Response(
                {'error': 'No attachment for this ticket'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        download_url = ticket.get_attachment_download_url()
        
        from django.shortcuts import redirect
        return redirect(download_url)
        
    except Ticket.DoesNotExist:
        return Response(
            {'error': 'Ticket not found'},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_ticket_attachment(request, ticket_id):
    """Vue pour visualiser l'attachement (sans forcer le téléchargement)"""
    try:
        ticket = Ticket.objects.get(id=ticket_id)
        
        if request.user.role != 'admin' and ticket.created_by != request.user:
            return Response(
                {'error': 'You do not have permission to access this ticket'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if not ticket.attachment:
            return Response(
                {'error': 'No attachment for this ticket'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if hasattr(ticket.attachment, 'url'):
            view_url = ticket.attachment.url
            from django.shortcuts import redirect
            return redirect(view_url)
        
        else:
            file_path = ticket.attachment.path
            if os.path.exists(file_path):
                content_type, encoding = mimetypes.guess_type(file_path)
                content_type = content_type or 'application/octet-stream'
                
                with open(file_path, 'rb') as f:
                    response = HttpResponse(f.read(), content_type=content_type)
                    response['Content-Disposition'] = f'inline; filename="{os.path.basename(file_path)}"'
                    return response
            else:
                return Response(
                    {'error': 'File not found on server'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
    except Ticket.DoesNotExist:
        return Response(
            {'error': 'Ticket not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )