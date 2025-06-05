from django.contrib import admin
from .models import Materia, Grupo, Estudiante, InscripcionEstudianteGrupo, SesionClase
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

class CustomUserAdmin(BaseUserAdmin):
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'email')}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2'),
        }),
    )
    def save_model(self, request, obj, form, change):
        if not obj.email:
            raise ValueError('El correo electrónico es obligatorio.')
        super().save_model(request, obj, form, change)

# Register your models here.
admin.site.register(Materia)
admin.site.register(Grupo)
admin.site.register(Estudiante)
admin.site.register(InscripcionEstudianteGrupo)
admin.site.register(SesionClase)
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)
