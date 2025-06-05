from rest_framework.routers import DefaultRouter
from .views import MateriaViewSet, GrupoViewSet, EstudianteViewSet, SesionClaseViewSet, LogoutView, PasswordResetRequestView, PasswordResetConfirmView, EmailTokenObtainPairView
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'materias', MateriaViewSet)
router.register(r'grupos', GrupoViewSet)
router.register(r'estudiantes', EstudianteViewSet)
router.register(r'sesiones', SesionClaseViewSet)

urlpatterns = router.urls

urlpatterns += [
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/password_reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    path('auth/password_reset/confirm/<int:uid>/<str:token>/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('auth/login/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]