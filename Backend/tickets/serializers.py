from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, Ticket
import cloudinary
from cloudinary.utils import cloudinary_url

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['email'] = user.email
        token['username'] = user.username
        return token


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'role', 'is_active', 'date_joined']
        read_only_fields = ['id', 'is_active', 'date_joined']


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'password2', 'role']
        extra_kwargs = {'role': {'default': 'user', 'required': False}}

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwords don't match"})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        return User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
            role=validated_data.get('role', 'user')
        )


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        if not attrs.get('email') or not attrs.get('password'):
            raise serializers.ValidationError("Email and password are required")
        return attrs


class TicketSerializer(serializers.ModelSerializer):
    created_by = serializers.SerializerMethodField()
    created_by_email = serializers.SerializerMethodField()
    created_by_id = serializers.SerializerMethodField()

    attachment_url = serializers.SerializerMethodField()
    attachment_view_url = serializers.SerializerMethodField()
    attachment_download_url = serializers.SerializerMethodField()

    class Meta:
        model = Ticket
        fields = [
            'id', 'title', 'description', 'category', 'status', 'priority',
            'attachment', 'attachment_name',
            'attachment_url', 'attachment_view_url', 'attachment_download_url',
            'created_by', 'created_by_email', 'created_by_id',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_by', 'created_at', 'updated_at',
            'attachment_url', 'attachment_view_url', 'attachment_download_url',
            'created_by_id'
        ]

    def get_created_by(self, obj):
        return obj.created_by.username if obj.created_by else None

    def get_created_by_email(self, obj):
        return obj.created_by.email if obj.created_by else None

    def get_created_by_id(self, obj):
        return obj.created_by.id if obj.created_by else None

    # --- Base Cloudinary URL ---
    def get_attachment_url(self, obj):
        if obj.attachment:
            try:
                return obj.attachment.url
            except:
                return None
        return None

    # --- View (inline) ---
    def get_attachment_view_url(self, obj):
        if not obj.attachment:
            return None

        try:
            public_id = obj.attachment.public_id
            format = obj.attachment.format

            # Force PDF → raw
            if format == "pdf":
                resource_type = "raw"
            else:
                resource_type = obj.attachment.resource_type or "image"

            url, options = cloudinary_url(
                public_id,
                format=format,
                resource_type=resource_type
            )
            return url

        except Exception as e:
            print("VIEW URL ERROR:", e)
            return None

    def get_attachment_download_url(self, obj):
        if obj.attachment:
            import cloudinary
            from cloudinary.utils import cloudinary_url
            
            try:
                url, options = cloudinary_url(
                    obj.attachment.public_id,
                    format=obj.attachment.format,
                    flags=['attachment'],
                    resource_type=obj.attachment.resource_type
                )
                return url
            except Exception:
                return obj.attachment.url
        return None

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class TicketCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ['title', 'description', 'category', 'attachment', 'attachment_name', 'priority']
        extra_kwargs = {
            'attachment': {'required': False},
            'attachment_name': {'required': False},
            'priority': {'required': False, 'default': 'Medium'}
        }


class TicketUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ['status']
        extra_kwargs = {'status': {'required': True}}
