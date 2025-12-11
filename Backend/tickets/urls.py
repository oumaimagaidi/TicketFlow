from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views
from .views import download_ticket_attachment  

router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='user')
router.register(r'tickets', views.TicketViewSet, basename='ticket')

urlpatterns = [
    path('', include(router.urls)),
    path('login/', views.CustomLoginView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('users/me/', views.UserViewSet.as_view({'get': 'me'}), name='user-me'),
    path('users/logout/', views.UserViewSet.as_view({'post': 'logout'}), name='user-logout'),
    
    path('tickets/<int:ticket_id>/download/', download_ticket_attachment, name='download-attachment'),
]