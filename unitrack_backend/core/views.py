# Create your views here.
from rest_framework import viewsets, permissions
from .models import Materia, Grupo, Estudiante, InscripcionEstudianteGrupo, SesionClase, AsistenciaEstudiante
from .serializers import MateriaSerializer, GrupoSerializer, EstudianteSerializer, SesionClaseSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from django.contrib.auth import logout as django_logout
from django.contrib.auth.models import User
from django.contrib.auth.models import update_last_login as django_update_last_login
from rest_framework_simplejwt.settings import api_settings as simple_jwt_api_settings
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from django.contrib.auth.tokens import default_token_generator
from django.urls import reverse
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import serializers

class MateriaViewSet(viewsets.ModelViewSet):
    queryset = Materia.objects.all()
    serializer_class = MateriaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Materia.objects.filter(docente=self.request.user)

    def perform_create(self, serializer):
        serializer.save(docente=self.request.user)

class GrupoViewSet(viewsets.ModelViewSet):
    queryset = Grupo.objects.all()
    serializer_class = GrupoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Solo los grupos de materias del docente autenticado
        return Grupo.objects.filter(materia__docente=self.request.user)

class EstudianteViewSet(viewsets.ModelViewSet):
    queryset = Estudiante.objects.all()
    serializer_class = EstudianteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Todos los estudiantes relacionados a grupos de materias del docente
        return Estudiante.objects.filter(
            inscripcionestudiantegrupo__grupo__materia__docente=self.request.user
        ).distinct()

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        grupo_id = data.pop('grupo', None)
        # Permitir crear estudiante solo si se especifica el grupo
        if not grupo_id:
            return Response({'error': 'El campo grupo es obligatorio.'}, status=status.HTTP_400_BAD_REQUEST)
        # Buscar por matrícula para evitar duplicados
        matricula = data.get('matricula') or data.get('studentId')
        estudiante = None
        if matricula:
            estudiante = Estudiante.objects.filter(matricula=matricula).first()
        if not estudiante:
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            estudiante = serializer.instance
        # Crear inscripción si no existe
        insc, created = InscripcionEstudianteGrupo.objects.get_or_create(
            estudiante=estudiante,
            grupo_id=grupo_id
        )
        return Response(self.get_serializer(estudiante).data, status=status.HTTP_201_CREATED)

class SesionClaseViewSet(viewsets.ModelViewSet):
    queryset = SesionClase.objects.all()
    serializer_class = SesionClaseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Solo sesiones de grupos de materias del docente
        return SesionClase.objects.filter(grupo__materia__docente=self.request.user)

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        asistencias_data = data.pop('asistencias', [])
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        sesion = serializer.instance
        # Crear asistencias
        for asistencia in asistencias_data:
            estudiante_id = asistencia.get('studentId')
            status = asistencia.get('status')
            if estudiante_id and status:
                AsistenciaEstudiante.objects.create(
                    sesion_clase=sesion,
                    estudiante_id=estudiante_id,
                    status=status
                )
        headers = self.get_success_headers(serializer.data)
        return Response(self.get_serializer(sesion).data, status=status.HTTP_201_CREATED, headers=headers)

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        django_logout(request)
        return Response({'detail': 'Logout exitoso.'}, status=status.HTTP_200_OK)

class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email requerido.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'Usuario no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        token = default_token_generator.make_token(user)
        reset_url = request.build_absolute_uri(
            reverse('password_reset_confirm', args=[user.pk, token])
        )
        send_mail(
            'Recuperar contraseña',
            f'Usa este enlace para restablecer tu contraseña: {reset_url}',
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
        return Response({'detail': 'Correo de recuperación enviado.'}, status=status.HTTP_200_OK)

class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, uid, token):
        password = request.data.get('password')
        if not password:
            return Response({'error': 'Nueva contraseña requerida.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(pk=uid)
        except User.DoesNotExist:
            return Response({'error': 'Usuario no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        if not default_token_generator.check_token(user, token):
            return Response({'error': 'Token inválido o expirado.'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(password)
        user.save()
        return Response({'detail': 'Contraseña restablecida correctamente.'}, status=status.HTTP_200_OK)

class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = get_user_model().EMAIL_FIELD

    def validate(self, attrs):
        email_field_name = self.username_field
        email = attrs.get(email_field_name)
        password = attrs.get('password')

        if not email or not password:
            raise serializers.ValidationError('Tanto el correo electrónico como la contraseña son obligatorios.')

        User = get_user_model()
        try:
            user = User.objects.get(**{email_field_name: email})
        except User.DoesNotExist:
            raise serializers.ValidationError('No existe un usuario con ese correo.')
        
        if not user.check_password(password):
            raise serializers.ValidationError('Contraseña incorrecta.')
            
        if not user.is_active:
            raise serializers.ValidationError('Usuario inactivo.')

        # Usuario autenticado manualmente, proceder a generar tokens.
        refresh = self.get_token(user) # self.get_token() es heredado de TokenObtainPairSerializer

        data = {}
        data["refresh"] = str(refresh)
        data["access"] = str(refresh.access_token)

        if simple_jwt_api_settings.UPDATE_LAST_LOGIN:
            django_update_last_login(None, user)
        
        return data

class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer