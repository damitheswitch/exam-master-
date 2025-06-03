import logging
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model, authenticate
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings

# Configure logger
logger = logging.getLogger(__name__)
from .serializers import (
    UserRegistrationSerializer, 
    UserLoginSerializer, 
    UserSerializer,
    UserProfileSerializer,
    AdminUserManagementSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer
)
from .permissions import IsAdminUser
import random
import string

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """User registration endpoint"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """User login endpoint"""
    try:
        logger.info(f"Login attempt with data: {request.data}")
        serializer = UserLoginSerializer(data=request.data, context={'request': request})
        
        if not serializer.is_valid():
            logger.warning(f"Login validation failed: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        user = serializer.validated_data['user']
        logger.info(f"User {user.email} authenticated successfully")
        
        try:
            refresh = RefreshToken.for_user(user)
            logger.info("Refresh token generated successfully")
            
            response_data = {
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
            logger.debug(f"Login response data: {response_data}")
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error generating tokens: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Error generating authentication tokens'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    except Exception as e:
        logger.error(f"Unexpected error in login view: {str(e)}", exc_info=True)
        return Response(
            {'error': 'An unexpected error occurred during login'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """User logout endpoint"""
    try:
        refresh_token = request.data["refresh"]
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    """Get user profile"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Update user profile"""
    serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserManagementView(generics.ListCreateAPIView):
    """Admin view for managing users"""
    queryset = User.objects.all()
    serializer_class = AdminUserManagementSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        queryset = User.objects.all()
        role = self.request.query_params.get('role', None)
        if role:
            queryset = queryset.filter(role=role)
        return queryset.order_by('-created_at')

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin view for managing individual users"""
    queryset = User.objects.all()
    serializer_class = AdminUserManagementSerializer
    permission_classes = [IsAdminUser]

def generate_reset_code():
    """Generate a 6-digit reset code"""
    return ''.join(random.choices(string.digits, k=6))

@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset(request):
    """Request password reset - sends reset code to email"""
    serializer = PasswordResetRequestSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        user = User.objects.get(email=email)
        
        # Generate reset code
        reset_code = generate_reset_code()
        user.reset_code = reset_code
        user.reset_code_expires = timezone.now() + timezone.timedelta(minutes=15)  # 15 minutes expiry
        user.save()
        
        # Send email (in production, you'd use a proper email service)
        try:
            send_mail(
                'Password Reset Code - ExamMaster',
                f'Your password reset code is: {reset_code}\n\nThis code will expire in 15 minutes.',
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            return Response({
                'message': 'Password reset code sent to your email.',
                'reset_code': reset_code  # Remove this in production!
            })
        except Exception as e:
            return Response({
                'message': 'Password reset code generated.',
                'reset_code': reset_code  # For development only
            })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def confirm_password_reset(request):
    """Confirm password reset with code and set new password"""
    serializer = PasswordResetConfirmSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        reset_code = serializer.validated_data['reset_code']
        new_password = serializer.validated_data['new_password']
        
        try:
            user = User.objects.get(email=email)
            
            # Check if reset code is valid and not expired
            if (user.reset_code != reset_code or 
                not user.reset_code_expires or 
                timezone.now() > user.reset_code_expires):
                return Response({
                    'error': 'Invalid or expired reset code.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Reset password
            user.set_password(new_password)
            user.reset_code = None
            user.reset_code_expires = None
            user.save()
            
            return Response({
                'message': 'Password reset successfully.'
            })
            
        except User.DoesNotExist:
            return Response({
                'error': 'User not found.'
            }, status=status.HTTP_404_NOT_FOUND)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) 