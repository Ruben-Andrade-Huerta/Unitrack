from rest_framework import serializers
from .models import Materia, Grupo, Estudiante, InscripcionEstudianteGrupo, SesionClase, AsistenciaEstudiante

class EstudianteSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(source='nombre_completo')
    studentId = serializers.CharField(source='matricula')
    class Meta:
        model = Estudiante
        fields = ['id', 'nombre', 'studentId']

class AsistenciaEstudianteSerializer(serializers.ModelSerializer):
    studentId = serializers.UUIDField(source='estudiante.id')
    class Meta:
        model = AsistenciaEstudiante
        fields = ['studentId', 'status']

class SesionClaseSerializer(serializers.ModelSerializer):
    asistencias = AsistenciaEstudianteSerializer(source='asistencias_detalle', many=True, read_only=True)
    class Meta:
        model = SesionClase
        fields = ['id', 'fecha', 'nombre', 'asistencias', 'grupo']

class GrupoSerializer(serializers.ModelSerializer):
    estudiantes = serializers.SerializerMethodField()
    sesiones = SesionClaseSerializer(many=True, read_only=True)
    class Meta:
        model = Grupo
        fields = ['id', 'nombre', 'materia', 'estudiantes', 'sesiones']

    def get_estudiantes(self, obj):
        # Devuelve la lista completa de estudiantes usando el serializador
        return [EstudianteSerializer(insc.estudiante).data for insc in obj.inscripciones.all()]

class MateriaSerializer(serializers.ModelSerializer):
    grupos = GrupoSerializer(many=True, read_only=True)
    class Meta:
        model = Materia
        fields = ['id', 'nombre', 'codigo', 'grupos']

class InscripcionEstudianteSerializer(serializers.ModelSerializer):
    class Meta:
        model = InscripcionEstudianteGrupo
        fields = ['id', 'estudiante', 'grupo']