from django.db import models

# Create your models here.

from django.db import models
from django.contrib.auth.models import User # o un AbstractUser personalizado
import uuid # Para IDs únicos si no se usan los auto-incrementales por defecto

class Materia(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    docente = models.ForeignKey(User, on_delete=models.CASCADE, related_name='materias')
    nombre = models.CharField(max_length=255)
    codigo = models.CharField(max_length=50)
    # created_at, updated_at (opcional, con auto_now_add y auto_now)

    def __str__(self):
        return f"{self.nombre} ({self.codigo})"

class Grupo(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    materia = models.ForeignKey(Materia, on_delete=models.CASCADE, related_name='grupos')
    nombre = models.CharField(max_length=100)
    # created_at, updated_at

    def __str__(self):
        return f"{self.nombre} - {self.materia.nombre}"

class Estudiante(models.Model):
    # Modelo central para estudiantes, si se desea que un estudiante pueda existir independientemente o
    # ser compartido entre diferentes docentes/sistemas.
    # Para el MVP actual, donde los estudiantes se añaden directamente a un grupo,
    # un modelo Estudiante vinculado directamente a Grupo podría ser más simple.
    # Optaremos por un modelo Estudiante que puede ser inscrito en Grupos.
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre_completo = models.CharField(max_length=255)
    matricula = models.CharField(max_length=50, unique=True) # ID de estudiante, debería ser único a nivel institución
    # created_at, updated_at

    def __str__(self):
        return f"{self.nombre_completo} ({self.matricula})"

class InscripcionEstudianteGrupo(models.Model):
    """ Modelo intermedio para la relación ManyToMany entre Estudiante y Grupo """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    estudiante = models.ForeignKey(Estudiante, on_delete=models.CASCADE)
    grupo = models.ForeignKey(Grupo, on_delete=models.CASCADE, related_name='inscripciones')
    # fecha_inscripcion = models.DateField(auto_now_add=True)

    class Meta:
        unique_together = ('estudiante', 'grupo') # Un estudiante solo puede estar una vez en el mismo grupo

    def __str__(self):
        return f"{self.estudiante.nombre_completo} en {self.grupo.nombre}"


class SesionClase(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    grupo = models.ForeignKey(Grupo, on_delete=models.CASCADE, related_name='sesiones')
    fecha = models.DateTimeField() # O DateField si la hora no es crucial para la sesión en sí
    nombre = models.CharField(max_length=100, blank=True) # Ej: "Sesión 1", autogenerado si es blank
    # created_at, updated_at

    def save(self, *args, **kwargs):
        if not self.nombre:
            count = SesionClase.objects.filter(grupo=self.grupo).count()
            self.nombre = f"Sesión {count + 1}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.nombre} - {self.grupo.nombre} ({self.fecha.strftime('%Y-%m-%d')})"

class AsistenciaEstudiante(models.Model):
    class AttendanceStatus(models.TextChoices):
        PRESENTE = 'Presente', 'Presente'
        AUSENTE = 'Ausente', 'Ausente'
        JUSTIFICADO = 'Justificado', 'Justificado'
        TARDE = 'Tarde', 'Tarde'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sesion_clase = models.ForeignKey(SesionClase, on_delete=models.CASCADE, related_name='asistencias_detalle')
    estudiante = models.ForeignKey(Estudiante, on_delete=models.CASCADE) # Referencia al Estudiante global
    status = models.CharField(max_length=20, choices=AttendanceStatus.choices)
    # created_at, updated_at

    class Meta:
        unique_together = ('sesion_clase', 'estudiante') # Un estudiante solo tiene un estado de asistencia por sesión

    def __str__(self):
        return f"{self.estudiante.nombre_completo} - {self.sesion_clase.nombre}: {self.status}"