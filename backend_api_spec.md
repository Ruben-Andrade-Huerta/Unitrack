
# UniTrack Backend API Specification (Django & Django REST Framework)

Este documento describe la API backend para la aplicación UniTrack, diseñada para ser implementada con Django y Django REST Framework (DRF).

## 1. Modelos de Django

Los modelos representan la estructura de datos de la aplicación.

```python
# En un archivo models.py dentro de una app de Django (ej. 'core')

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

```

## 2. Autenticación

Se utilizará autenticación basada en tokens. Django REST Framework ofrece `TokenAuthentication` (simple) o se puede usar `djangorestframework-simplejwt` para JWT.

**Endpoints de Autenticación:**

*   **`POST /api/auth/login/`**
    *   **Request Body:** `{ "username": "user@example.com", "password": "mypassword" }`
    *   **Response (200 OK):** `{ "token": "your_auth_token_here", "user_id": 1, "username": "user@example.com" }`
    *   **Response (400 Bad Request):** Error de credenciales.
*   **`POST /api/auth/logout/`** (Opcional si el token se maneja solo en el cliente)
    *   **Request Headers:** `Authorization: Token your_auth_token_here`
    *   **Response (200 OK / 204 No Content):** Logout exitoso.
*   **`GET /api/auth/user/`** (Opcional, para obtener datos del usuario actual)
    *   **Request Headers:** `Authorization: Token your_auth_token_here`
    *   **Response (200 OK):** `{ "id": 1, "username": "user@example.com", "email": "user@example.com", ... }`
*   **Password Reset:**
    *   `POST /api/auth/password_reset/`
    *   `POST /api/auth/password_reset/confirm/`

## 3. Endpoints de API y Serializadores (DRF)

Todos los endpoints estarán prefijados con `/api/`. Se asumirá que el usuario (docente) está autenticado para acceder a estos endpoints. Los permisos asegurarán que un docente solo pueda acceder a sus propias materias y datos relacionados.

---

### 3.1. Materias (Subjects)

*   **Serializador `MateriaSerializer`:**
    *   Campos: `id`, `nombre`, `codigo`. Opcionalmente `grupos` (como IDs o anidados).

*   **`GET /api/materias/`**
    *   **Descripción:** Lista todas las materias del docente autenticado.
    *   **Response (200 OK):** `List<Materia>` (estructura de `types.ts`)
        ```json
        [
          { "id": "uuid1", "nombre": "Cálculo I", "codigo": "MAT101", "grupos": [...] },
          { "id": "uuid2", "nombre": "Álgebra Lineal", "codigo": "MAT102", "grupos": [...] }
        ]
        ```
*   **`POST /api/materias/`**
    *   **Descripción:** Crea una nueva materia para el docente autenticado.
    *   **Request Body:** `{ "nombre": "Nueva Materia", "codigo": "NM101" }`
    *   **Response (201 Created):** `Materia` (la materia creada)
        ```json
        { "id": "new_uuid", "nombre": "Nueva Materia", "codigo": "NM101", "grupos": [] }
        ```
*   **`GET /api/materias/<materiaId>/`**
    *   **Descripción:** Obtiene los detalles de una materia específica, incluyendo sus grupos.
    *   **Response (200 OK):** `Materia`
*   **`PUT /api/materias/<materiaId>/`**
    *   **Descripción:** Actualiza una materia.
    *   **Request Body:** `{ "nombre": "Nombre Actualizado", "codigo": "CODIGO_ACT" }`
    *   **Response (200 OK):** `Materia` (actualizada)
*   **`DELETE /api/materias/<materiaId>/`**
    *   **Descripción:** Elimina una materia.
    *   **Response (204 No Content)**

---

### 3.2. Grupos (Groups)

*   **Serializador `GrupoSerializer`:**
    *   Campos: `id`, `nombre`, `materia` (ID de la materia). Opcionalmente `estudiantes` y `sesiones` (IDs o anidados).

*   **`GET /api/materias/<materiaId>/grupos/`** (Alternativa: `GET /api/grupos/?materia_id=<materiaId>`)
    *   **Descripción:** Lista todos los grupos de una materia específica.
    *   **Response (200 OK):** `List<Grupo>`
        ```json
        [
          { "id": "uuid_g1", "nombre": "Grupo A", "materiaId": "uuid_m1", "estudiantes": [], "sesiones": [] },
          ...
        ]
        ```
*   **`POST /api/materias/<materiaId>/grupos/`**
    *   **Descripción:** Crea un nuevo grupo para una materia.
    *   **Request Body:** `{ "nombre": "Grupo Nuevo" }`
    *   **Response (201 Created):** `Grupo` (el grupo creado)
*   **`GET /api/grupos/<grupoId>/`**
    *   **Descripción:** Obtiene los detalles de un grupo específico, incluyendo su materia, estudiantes y sesiones.
    *   **Response (200 OK):** `Grupo` (con `materia` anidada o como ID, `estudiantes`, `sesiones`)
        ```json
        // Estructura similar a la de types.ts Group, donde materiaId es el ID
        // y materia (objeto) podría ser un campo adicional si se serializa con profundidad.
        {
          "id": "grp1a",
          "nombre": "Grupo A",
          "materiaId": "subj1", // O "materia": { "id": "subj1", "nombre": "Cálculo I", ...}
          "estudiantes": [ { "id": "std1", "nombre": "Ana Pérez", "studentId": "A001" }, ... ],
          "sesiones": [ { "id": "ses1", "fecha": "...", "asistencias": [...], "nombre": "Sesión 1" }, ... ]
        }
        ```
*   **`PUT /api/grupos/<grupoId>/`**
    *   **Descripción:** Actualiza un grupo.
    *   **Request Body:** `{ "nombre": "Nombre Grupo Actualizado" }`
    *   **Response (200 OK):** `Grupo` (actualizado)
*   **`DELETE /api/grupos/<grupoId>/`**
    *   **Descripción:** Elimina un grupo.
    *   **Response (204 No Content)**

---

### 3.3. Estudiantes (Students)

*   **Serializador `EstudianteSerializer`:**
    *   Campos: `id`, `nombre_completo` (mapeado a `nombre` en frontend), `matricula` (mapeado a `studentId`).
*   **Serializador `InscripcionEstudianteSerializer`:** (Para manejar la adición/listado de estudiantes a grupos)
    *   Campos: `estudiante` (anidado o ID), `grupo` (ID).

*   **`GET /api/grupos/<grupoId>/estudiantes/`**
    *   **Descripción:** Lista todos los estudiantes inscritos en un grupo específico.
    *   **Response (200 OK):** `List<Estudiante>` (como en `types.ts Student`)
        ```json
        [
          { "id": "uuid_e1", "nombre": "Ana Pérez", "studentId": "A001" },
          ...
        ]
        ```
*   **`POST /api/grupos/<grupoId>/estudiantes/`**
    *   **Descripción:** Inscribe un nuevo estudiante a un grupo. Si el estudiante no existe (por matrícula), se crea primero.
    *   **Request Body:** `{ "nombre": "Nuevo Estudiante", "studentId": "MAT00X" }` (corresponde a `Omit<Student, 'id'>`)
    *   **Response (201 Created):** `Estudiante` (el estudiante inscrito/creado)
*   **`GET /api/estudiantes/<estudianteId>/`** (donde `estudianteId` es el ID de la BBDD, no la matrícula)
    *   **Descripción:** Obtiene los detalles de un estudiante.
    *   **Response (200 OK):** `Estudiante`
*   **`PUT /api/estudiantes/<estudianteId>/`**
    *   **Descripción:** Actualiza los datos de un estudiante.
    *   **Request Body:** `{ "nombre": "Nombre Actualizado", "studentId": "MAT00Y" }`
    *   **Response (200 OK):** `Estudiante` (actualizado)
*   **`DELETE /api/grupos/<grupoId>/estudiantes/<estudianteId>/`** (o usando el ID de Inscripción)
    *   **Descripción:** Elimina (desinscribe) un estudiante de un grupo.
    *   **Response (204 No Content)**

---

### 3.4. Sesiones de Clase y Asistencia (Class Sessions & Attendance)

*   **Serializador `AsistenciaEstudianteSerializer`:**
    *   Campos: `estudiante` (ID del estudiante), `status`.
*   **Serializador `SesionClaseSerializer`:**
    *   Campos: `id`, `fecha`, `nombre`, `asistencias` (lista de `AsistenciaEstudianteSerializer` anidados), `grupo` (ID).

*   **`GET /api/grupos/<grupoId>/sesiones/`**
    *   **Descripción:** Lista todas las sesiones de clase de un grupo.
    *   **Response (200 OK):** `List<SesionClase>` (como en `types.ts ClassSession`)
        ```json
        [
          {
            "id": "uuid_s1",
            "fecha": "2023-10-26T10:00:00Z",
            "nombre": "Sesión 1",
            "asistencias": [
              { "studentId": "uuid_e1", "status": "Presente" }, // Nota: frontend usa studentId (matrícula), backend usará ID de BBDD para estudiante
                                                              // El serializador debe mapear el ID del Estudiante a studentId (matrícula) para la respuesta, o el frontend ajustarse.
                                                              // Por consistencia, se usará el ID del modelo Estudiante en el backend.
                                                              // El frontend mapeará el id de Student a studentId en el objeto AsistenciaEstudiante.
                                                              // Aquí, para que coincida con types.ts, studentId se refiere al ID del modelo Student.
              { "studentId": "uuid_e2", "status": "Ausente" }
            ]
          },
          ...
        ]
        ```
     *  **Nota importante sobre `StudentAttendance.studentId`**: En `types.ts`, `StudentAttendance.studentId` es el `id` del `Student`. El backend debe asegurar que el `estudiante` en `AsistenciaEstudianteSerializer` se serialice como un `studentId` que corresponda al `id` del `Estudiante` en la base de datos, no a su matrícula.

*   **`POST /api/grupos/<grupoId>/sesiones/`**
    *   **Descripción:** Crea una nueva sesión de clase (incluyendo los registros de asistencia).
    *   **Request Body:** `Omit<ClassSession, 'id' | 'nombre'>` (como en `types.ts`)
        ```json
        {
          "fecha": "2023-10-27T14:00:00Z",
          "asistencias": [ // studentId aquí es el ID del modelo Estudiante
            { "studentId": "uuid_e1", "status": "Presente" },
            { "studentId": "uuid_e3", "status": "Tarde" }
          ]
        }
        ```
    *   **Response (201 Created):** `SesionClase` (la sesión creada, con su `nombre` autogenerado si no se proveyó).
*   **`GET /api/sesiones/<sesionId>/`**
    *   **Descripción:** Obtiene los detalles de una sesión de clase específica.
    *   **Response (200 OK):** `SesionClase`
*   **`PUT /api/sesiones/<sesionId>/`**
    *   **Descripción:** Actualiza una sesión de clase (ej. para modificar asistencias).
    *   **Request Body:** `SesionClase` (completa o los campos a actualizar).
    *   **Response (200 OK):** `SesionClase` (actualizada).
*   **`DELETE /api/sesiones/<sesionId>/`**
    *   **Descripción:** Elimina una sesión de clase.
    *   **Response (204 No Content)**

---

### 3.5. Dashboard / Datos Adicionales

*   **`GET /api/dashboard/today_classes/`** (Endpoint para `INITIAL_TODAY_CLASSES`)
    *   **Descripción:** Devuelve una lista de clases programadas para hoy para el docente. (La lógica para determinar "hoy" y "programadas" necesita definirse, por ahora podría ser un placeholder o basado en las sesiones existentes).
    *   **Response (200 OK):** `List<TodayClass>` (como en `types.ts`)
        ```json
        [
          { "subjectId":"subj1", "groupId":"grp1a", "subjectName": "Cálculo I", "groupName": "Grupo A", "time": "10:00 AM - 11:30 AM" },
          ...
        ]
        ```
    *   **Consideración:** Este endpoint podría ser más complejo de implementar si requiere un sistema de horarios. Para una versión simple, podría listar sesiones cuya `fecha` sea hoy.

## 4. Consideraciones Adicionales

*   **Permisos (DRF Permissions):**
    *   Implementar clases de permisos personalizadas para asegurar que un `User` (docente) solo pueda ver/modificar sus propias `Materias` y los datos anidados (`Grupos`, `Sesiones`, etc.).
*   **Validaciones:**
    *   DRF Serializers se encargarán de la mayoría de las validaciones a nivel de campo. Lógica de validación adicional puede ir en los métodos `validate()` de los serializadores o en los métodos `clean()` de los modelos.
*   **UUIDs vs IDs Auto-incrementales:**
    *   El ejemplo usa UUIDs para los IDs de los modelos. Esto es una buena práctica para evitar colisiones si los datos se fusionan o exponen externamente. Django maneja esto bien con `models.UUIDField`. Si se prefieren IDs auto-incrementales, simplemente se omite el campo `id` en los modelos y Django lo crea.
*   **Rendimiento:**
    *   Para endpoints de lista que pueden devolver muchos datos anidados (ej. `GET /api/materias/` con todos sus grupos, estudiantes y sesiones), considerar:
        *   **Paginación.**
        *   Serializadores con profundidad controlada (`depth` en DRF) o serializadores específicos para vistas de lista que omitan detalles anidados.
        *   Usar `select_related` y `prefetch_related` en los QuerySets de Django para optimizar las consultas a la base de datos.
*   **Nomenclatura:** Mantener consistencia entre los nombres de campos del frontend (TypeScript) y el backend (Python/Django). Donde haya diferencias (ej. `studentId` vs `matricula`), el serializador puede encargarse del mapeo.

Esta especificación debería proporcionar una base sólida para el desarrollo del backend de UniTrack con Django.
