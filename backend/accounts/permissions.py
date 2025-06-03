from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow admin users.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_admin

class IsTeacherOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow teachers and admin users.
    """
    def has_permission(self, request, view):
        return (request.user and request.user.is_authenticated and 
                (request.user.is_teacher or request.user.is_admin))

class IsStudentUser(permissions.BasePermission):
    """
    Custom permission to only allow student users.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_student

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or admin users to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner or admin
        return obj.user == request.user or request.user.is_admin 
 