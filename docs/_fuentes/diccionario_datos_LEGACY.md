# Diccionario de Datos - Global Effect Nexus (PostgreSQL)

Este documento contiene la definición y descripción detallada de cada tabla, columna, tipo de dato y restricción que conforma la base de datos de **Global Effect Nexus** desplegada en **Supabase**.

---

## Índice de Tablas
1. **Identidad y Acceso:** `rol`, `permiso`, `rol_permiso`, `usuario`
2. **Soporte y Auditoría:** `documento`, `notificacion`, `audit_log`
3. **Patrocinio:** `patrocinador`, `asignacion_beca`
4. **Estudiantes (Expedientes):** `estudiante`, `familiar`, `perfil_vivienda`, `perfil_salud`, `perfil_socioeconomico`
5. **Académico:** `periodo`, `materia`, `curso`, `inscripcion`, `calificacion`, `historial_calificacion`
6. **Academias:** `academia`, `material`
7. **Psicología:** `cita_psicologia`, `nota_psicologica`, `perfil_psicologico`
8. **Operación y Proyectos:** `proyecto`, `tarea`, `tarea_asignado`, `evento`, `registro_servicio`
9. **Servicios de Almuerzo:** `inscripcion_comida`
10. **Finanzas:** `transaccion`

---

## 1. Dominio de Identidad y Control de Acceso (RBAC)

### Tabla: `rol`
Almacena los roles de seguridad del sistema.
*   **Clave Primaria:** `id`

| Columna | Tipo de Dato | Nulo | Claves / Restricciones | Descripción |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | No | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Identificador único del rol. |
| `nombre` | `TEXT` | No | `UNIQUE` | Código del rol (ej: 'admin', 'estudiante'). |
| `descripcion` | `TEXT` | Sí | - | Explicación detallada de las facultades del rol. |
| `created_at` | `TIMESTAMPTZ`| No | `DEFAULT now()` | Fecha de creación del registro. |
| `updated_at` | `TIMESTAMPTZ`| No | `DEFAULT now()`, Trigger automático | Fecha de última modificación. |

---

### Tabla: `permiso`
Define los privilegios específicos aplicables a las vistas o acciones del backend.
*   **Clave Primaria:** `id`

| Columna | Tipo de Dato | Nulo | Claves / Restricciones | Descripción |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | No | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Identificador único del permiso. |
| `codigo` | `TEXT` | No | `UNIQUE` | Clave del permiso (ej: 'expedientes.leer'). |
| `descripcion` | `TEXT` | Sí | - | Funcionalidad o módulo que resguarda el permiso. |
| `created_at` | `TIMESTAMPTZ`| No | `DEFAULT now()` | Fecha de creación. |
| `updated_at` | `TIMESTAMPTZ`| No | `DEFAULT now()`, Trigger automático | Fecha de modificación. |

---

### Tabla: `rol_permiso`
Tabla intermedia de unión `N:M` que vincula roles con permisos.
*   **Clave Primaria Compuesta:** `(rol_id, permiso_id)`

| Columna | Tipo de Dato | Nulo | Claves / Restricciones | Descripción |
| :--- | :--- | :---: | :--- | :--- |
| `rol_id` | `UUID` | No | `FOREIGN KEY REFERENCES rol(id) ON DELETE CASCADE` | Identificador del rol. |
| `permiso_id` | `UUID` | No | `FOREIGN KEY REFERENCES permiso(id) ON DELETE CASCADE` | Identificador del permiso asignado. |

---

### Tabla: `usuario`
Credenciales y perfil básico del personal y estudiantes que acceden a la plataforma.
*   **Clave Primaria:** `id`

| Columna | Tipo de Dato | Nulo | Claves / Restricciones | Descripción |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | No | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Identificador único del usuario. |
| `email` | `TEXT` | No | `UNIQUE` | Correo electrónico institucional y usuario de login. |
| `password_hash`| `TEXT` | No | - | Contraseña cifrada (Bcrypt / Argon2). |
| `nombre` | `TEXT` | No | - | Nombre completo del usuario. |
| `idioma` | `TEXT` | No | `DEFAULT 'es'` | Preferencia de idioma para la internacionalización (es/en). |
| `activo` | `BOOLEAN` | No | `DEFAULT TRUE` | Estado de acceso del usuario al sistema. |
| `rol_id` | `UUID` | No | `FOREIGN KEY REFERENCES rol(id)` | Rol asignado al usuario. |
| `created_at` | `TIMESTAMPTZ`| No | `DEFAULT now()` | Fecha de registro. |
| `updated_at` | `TIMESTAMPTZ`| No | `DEFAULT now()`, Trigger automático | Fecha de última modificación. |

---

## 2. Dominio Transversal (Documentos y Auditoría)

### Tabla: `documento`
Metadatos de archivos subidos al Supabase Storage. Reemplaza URLs crudas para garantizar consistencia.
*   **Clave Primaria:** `id`

| Columna | Tipo de Dato | Nulo | Claves / Restricciones | Descripción |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | No | `PRIMARY KEY` | Identificador único del archivo. |
| `nombre` | `TEXT` | No | - | Nombre original del archivo subido. |
| `storage_key` | `TEXT` | No | `UNIQUE` | Dirección física dentro del bucket de storage. |
| `tipo` | `TEXT` | Sí | - | Categoría (foto, expediente, etc.). |
| `mime` | `TEXT` | Sí | - | Tipo MIME del archivo (ej. `image/png`, `application/pdf`). |
| `tamano_bytes` | `BIGINT` | Sí | - | Tamaño en bytes. |
| `subido_por_id`| `UUID` | Sí | `FOREIGN KEY REFERENCES usuario(id) ON DELETE SET NULL` | Usuario que cargó el documento. |
| `created_at` | `TIMESTAMPTZ`| No | `DEFAULT now()` | Fecha de subida. |

---

### Tabla: `audit_log`
Historial detallado de operaciones de escritura/eliminación para auditorías de tesis.
*   **Clave Primaria:** `id`

| Columna | Tipo de Dato | Nulo | Claves / Restricciones | Descripción |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | No | `PRIMARY KEY` | Identificador único del log. |
| `usuario_id` | `UUID` | Sí | `FOREIGN KEY REFERENCES usuario(id) ON DELETE SET NULL` | Usuario responsable de la acción. |
| `accion` | `TEXT` | No | - | Tipo de operación (INSERT, UPDATE, DELETE). |
| `entidad` | `TEXT` | No | - | Nombre de la tabla modificada. |
| `entidad_id` | `UUID` | Sí | - | ID del registro modificado. |
| `datos` | `JSONB` | Sí | - | Registro de cambios en formato JSON. |
| `created_at` | `TIMESTAMPTZ`| No | `DEFAULT now()` | Fecha del suceso. |

---

## 3. Dominio de Estudiantes (Expedientes Normalizados)

### Tabla: `estudiante`
Datos principales e institucionales del estudiante.
*   **Clave Primaria:** `id`

| Columna | Tipo de Dato | Nulo | Claves / Restricciones | Descripción |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | No | `PRIMARY KEY` | Identificador único del estudiante. |
| `nombre` | `TEXT` | No | - | Nombre completo. |
| `cedula` | `TEXT` | Sí | `UNIQUE` | Cédula nacional de identidad / pasaporte. |
| `email` | `TEXT` | Sí | - | Correo personal de contacto. |
| `telefono` | `TEXT` | Sí | - | Teléfono móvil o fijo. |
| `fecha_nacimiento`| `DATE` | Sí | - | Fecha de nacimiento. |
| `lugar_nacimiento`| `TEXT` | Sí | - | Ciudad/municipio de nacimiento. |
| `nacionalidad` | `TEXT` | Sí | `DEFAULT 'Dominicana'` | Nacionalidad. |
| `genero` | `genero` | Sí | `ENUM` ('masculino', 'femenino', 'otro') | Identidad de género del alumno. |
| `sexo_documento`| `TEXT` | Sí | - | Sexo biológico oficial. |
| `religion` | `TEXT` | Sí | - | Afiliación religiosa. |
| `foto_id` | `UUID` | Sí | `FOREIGN KEY REFERENCES documento(id)` | Foto del perfil (FK). |
| `tipo` | `tipo_estudiante`| No| `DEFAULT 'regular'` (becado / regular) | Tipo de beneficiario. |
| `estado` | `estado_estudiante`| No| `DEFAULT 'activo'` ('reclutado', 'postulado', 'academia_liderazgo', 'standby_tecnico', 'activo', 'inactivo', 'graduado', 'suspendido') | Estatus en el pipeline y estado escolar actual. |
| `programa` | `TEXT` | Sí | - | Carrera universitaria o curso técnico activo. |
| `donde_estudia`| `TEXT` | Sí | - | Nombre de la institución educativa. |
| `universidad` | `TEXT` | Sí | - | Universidad física (becados). |
| `fecha_ingreso`| `DATE` | Sí | - | Fecha de incorporación a la fundación. |
| `patrocinador_id`| `UUID` | Sí | `FOREIGN KEY REFERENCES patrocinador(id)` | Patrocinador actual asignado. |
| `facilitador_habitudes`| `TEXT`| Sí | - | Nombre del instructor en Habitudes. |
| `centro_educativo`| `TEXT` | Sí | - | Escuela secundaria de origen. |
| `director_centro`| `TEXT` | Sí | - | Director del centro secundario. |
| `imagen_habitudes_id`| `UUID`| Sí | `FOREIGN KEY REFERENCES documento(id)` | Imagen adjunta del programa Habitudes. |
| `breve_historia_habitudes`| `TEXT`| Sí | - | Resumen histórico Habitudes. |
| `amonestaciones`| `TEXT` | Sí | - | Reportes de mala conducta académicos. |
| `solicitudes_pendientes`| `TEXT`| Sí | - | Peticiones del alumno por procesar. |
| `envio_correo_patrocinador`| `TEXT`| Sí | `DEFAULT 'pendiente'` | Estatus de cartas al patrocinador. |
| `asistio_reunion_mensual`| `TEXT`| Sí | `DEFAULT 'no'` | Estatus de asistencia administrativa. |
| `expediente_id`| `UUID` | Sí | `FOREIGN KEY REFERENCES documento(id)` | Documento escaneado completo (FK). |
| `notas_adicionales`| `TEXT` | Sí | - | Observaciones operativas varias. |
| `usuario_id` | `UUID` | Sí | `UNIQUE`, `FOREIGN KEY REFERENCES usuario(id)` | Cuenta de login del estudiante. |
| `created_at` | `TIMESTAMPTZ`| No | `DEFAULT now()` | Creación del expediente. |
| `updated_at` | `TIMESTAMPTZ`| No | `DEFAULT now()`, Trigger | Última edición del expediente. |

---

### Tabla: `familiar`
Almacena la red familiar inmediata de los estudiantes (relación `1:N`).
*   **Clave Primaria:** `id`

| Columna | Tipo de Dato | Nulo | Claves / Restricciones | Descripción |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | No | `PRIMARY KEY` | Identificador único del familiar. |
| `estudiante_id`| `UUID` | No | `FOREIGN KEY REFERENCES estudiante(id) ON DELETE CASCADE` | Estudiante patrocinado asociado. |
| `parentesco` | `parentesco` | No | `ENUM` ('padre', 'madre', 'tutor', 'madrastra', 'padrastro', etc.) | Relación familiar. |
| `nombre` | `TEXT` | No | - | Nombre completo del familiar. |
| `edad` | `INTEGER` | Sí | `CHECK (edad >= 0)` | Edad en años. |
| `telefono` | `TEXT` | Sí | - | Teléfono de contacto. |
| `profesion` | `TEXT` | Sí | - | Ocupación laboral principal. |

---

### Tabla: `perfil_vivienda`
Información detallada sobre las condiciones del hogar del estudiante (`1:1`).
*   **Clave Primaria:** `estudiante_id`

| Columna | Tipo de Dato | Nulo | Claves / Restricciones | Descripción |
| :--- | :--- | :---: | :--- | :--- |
| `estudiante_id`| `UUID` | No | `PRIMARY KEY`, `REFERENCES estudiante(id) ON DELETE CASCADE` | Estudiante asociado (FK). |
| `con_quien_vive`| `TEXT` | Sí | - | Personas con las que cohabita. |
| `por_que_vive_con_esa_persona`| `TEXT`| Sí| - | Contexto familiar residencial. |
| `hermanos_cantidad`| `INTEGER`| No | `DEFAULT 0`, `CHECK (hermanos_cantidad >= 0)` | Cantidad de hermanos menores. |
| `casa_propia` | `TEXT` | Sí | - | Estatus de la vivienda (propia, prestada, alquilada). |
| `tipo_casa` | `TEXT` | Sí | - | Descripción de infraestructura física. |
| `bano_dentro` | `TEXT` | Sí | - | Ubicación del baño (dentro, fuera). |
| `habitaciones` | `INTEGER` | No | `DEFAULT 0`, `CHECK (habitaciones >= 0)` | Número de habitaciones físicas. |
| `camas` | `INTEGER` | No | `DEFAULT 0`, `CHECK (camas >= 0)` | Número de camas. |
| `quienes_duermen_cama`| `TEXT` | Sí | - | Distribución en las habitaciones. |
| `direccion` | `TEXT` | Sí | - | Calle, número y sector físico. |
| `comunidad` | `TEXT` | Sí | - | Nombre de la comunidad / barrio. |
| `ciudad_residencia`| `TEXT` | Sí | - | Municipio o ciudad. |
| `pais_residencia`| `TEXT` | No | `DEFAULT 'República Dominicana'` | País de residencia actual. |

---

## 4. Dominio de Cursos y Académico

### Tabla: `periodo`
Enmarca los ciclos escolares institucionales de la fundación.
*   **Clave Primaria:** `id`

| Columna | Tipo de Dato | Nulo | Claves / Restricciones | Descripción |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | No | `PRIMARY KEY` | Identificador único del ciclo. |
| `nombre` | `TEXT` | No | `UNIQUE` | Código de ciclo (ej: '2026-I'). |
| `fecha_inicio` | `DATE` | No | - | Fecha de inicio de clases. |
| `fecha_fin` | `DATE` | No | - | Fecha de cierre de clases. |
| `estado` | `TEXT` | No | `DEFAULT 'planificado'` (activo, completado, etc.) | Estado del cuatrimestre. |
| `created_at` | `TIMESTAMPTZ`| No | `DEFAULT now()` | Fecha de creación. |
| `updated_at` | `TIMESTAMPTZ`| No | `DEFAULT now()`, Trigger | Fecha de modificación. |

---

### Tabla: `calificacion`
Calificaciones detalladas obtenidas en evaluaciones por los alumnos en cursos técnicos.
*   **Clave Primaria:** `id`

| Columna | Tipo de Dato | Nulo | Claves / Restricciones | Descripción |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | No | `PRIMARY KEY` | Identificador único del registro de nota. |
| `estudiante_id`| `UUID` | No | `FOREIGN KEY REFERENCES estudiante(id) ON DELETE CASCADE` | Estudiante calificado. |
| `curso_id` | `UUID` | No | `FOREIGN KEY REFERENCES curso(id) ON DELETE CASCADE` | Curso técnico al que pertenece. |
| `periodo_id` | `UUID` | No | `FOREIGN KEY REFERENCES periodo(id) ON DELETE CASCADE` | Período académico en curso. |
| `nota` | `NUMERIC(5,2)`| No | `CHECK (nota >= 0.00 AND nota <= 100.00)` | Calificación numérica (0 a 100). |
| `tipo_evaluacion`| `tipo_evaluacion`| No| `ENUM` ('examen', 'tarea', 'proyecto', etc.) | Rubro evaluado. |
| `observaciones`| `TEXT` | Sí | - | Apuntes de desempeño por el docente. |

---

## 5. Dominio de Psicología (Confidencial)

### Tabla: `cita_psicologia`
Gestión de agendas y solicitudes del departamento de bienestar emocional.
*   **Clave Primaria:** `id`

| Columna | Tipo de Dato | Nulo | Claves / Restricciones | Descripción |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | No | `PRIMARY KEY` | Identificador de la cita. |
| `estudiante_id`| `UUID` | No | `FOREIGN KEY REFERENCES estudiante(id) ON DELETE CASCADE` | Estudiante asistente. |
| `psicologo_id` | `UUID` | Sí | `FOREIGN KEY REFERENCES usuario(id) ON DELETE SET NULL` | Profesional a cargo (Usuario). |
| `tipo_registro`| `TEXT` | No | `DEFAULT 'cita'` (cita, seguimiento, evaluacion) | Tipo de sesión. |
| `fecha` | `DATE` | No | - | Fecha de la cita. |
| `hora` | `TEXT` | Sí | - | Formato de hora agenda. |
| `nivel_confidencialidad`| `TEXT`| No| `DEFAULT 'medio'` (alto, medio, bajo) | Grado de seguridad de la sesión. |
| `estado` | `TEXT` | No | `DEFAULT 'programada'` | Estatus (programada, completada, cancelada). |
| `riesgos` | `TEXT` | Sí | - | Alertas detectadas (ej. ideación, abuso). |

---

### Tabla: `nota_psicologica`
Contenido sensible de las sesiones con psicólogos. Aislado por estricta confidencialidad.
*   **Clave Primaria:** `id`

| Columna | Tipo de Dato | Nulo | Claves / Restricciones | Descripción |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | No | `PRIMARY KEY` | Identificador de la nota. |
| `cita_id` | `UUID` | Sí | `FOREIGN KEY REFERENCES cita_psicologia(id) ON DELETE CASCADE` | Cita psicológica de origen. |
| `estudiante_id`| `UUID` | No | `FOREIGN KEY REFERENCES estudiante(id) ON DELETE CASCADE` | Paciente asociado. |
| `contenido` | `TEXT` | No | - | Redacción confidencial e íntima de la sesión. |
| `creado_por_id`| `UUID` | Sí | `FOREIGN KEY REFERENCES usuario(id) ON DELETE SET NULL` | Profesional redactor. |
| `created_at` | `TIMESTAMPTZ`| No | `DEFAULT now()` | Fecha de registro. |

---

### Tabla: `perfil_psicologico`
Expediente psicológico y de evolución emocional privado (relación `1:1` con `estudiante`). Se crea únicamente al ingresar a la beca universitaria y goza de acceso restringido a psicólogos y super administradores.
*   **Clave Primaria:** `estudiante_id`

| Columna | Tipo de Dato | Nulo | Claves / Restricciones | Descripción |
| :--- | :--- | :---: | :--- | :--- |
| `estudiante_id` | `UUID` | No | `PRIMARY KEY`, `FOREIGN KEY REFERENCES estudiante(id) ON DELETE CASCADE` | Identificador del estudiante asociado. |
| `antecedentes_clinicos` | `TEXT` | Sí | - | Historial clínico y psicológico anterior del estudiante. |
| `evaluacion_inicial` | `TEXT` | Sí | - | Diagnóstico o evaluación emocional de ingreso. |
| `recomendaciones_terap` | `TEXT` | Sí | - | Pautas de intervención recomendadas. |
| `estado_emocional` | `TEXT` | Sí | - | Estado actual y progreso conductual. |
| `observaciones_generales`| `TEXT` | Sí | - | Apuntes complementarios no médicos. |
| `created_at` | `TIMESTAMPTZ`| No | `DEFAULT now()` | Fecha de creación del registro. |
| `updated_at` | `TIMESTAMPTZ`| No | `DEFAULT now()`, Trigger | Fecha de última modificación. |

---

## 6. Dominio de Operación, Tareas y Proyectos

### Tabla: `tarea`
Tareas asignadas del flujo administrativo.
*   **Clave Primaria:** `id`

| Columna | Tipo de Dato | Nulo | Claves / Restricciones | Descripción |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | No | `PRIMARY KEY` | Identificador de la tarea. |
| `titulo` | `TEXT` | No | - | Título descriptivo de la actividad. |
| `descripcion` | `TEXT` | Sí | - | Detalle de las especificaciones requeridas. |
| `proyecto_id` | `UUID` | Sí | `FOREIGN KEY REFERENCES proyecto(id) ON DELETE SET NULL` | Proyecto institucional agrupador (FK). |
| `visibilidad` | `TEXT` | No | `DEFAULT 'asignados'` (todos, asignados) | Nivel de visibilidad de la tarea. |
| `estado` | `TEXT` | No | `DEFAULT 'pendiente'` (pendiente, en_progreso, completada, etc.) | Estado en el Kanban. |
| `prioridad` | `TEXT` | No | `DEFAULT 'media'` (baja, media, alta, urgente) | Clasificación de urgencia. |
| `fecha_limite` | `DATE` | Sí | - | Plazo máximo de entrega. |
| `created_at` | `TIMESTAMPTZ`| No | `DEFAULT now()` | Fecha de asignación. |
| `updated_at` | `TIMESTAMPTZ`| No | `DEFAULT now()`, Trigger | Fecha de última edición. |

---

### Tabla: `tarea_asignado`
Tabla intermedia de relación `N:M` que asocia múltiples usuarios responsables a una tarea específica.
*   **Clave Primaria Compuesta:** `(tarea_id, usuario_id)`

| Columna | Tipo de Dato | Nulo | Claves / Restricciones | Descripción |
| :--- | :--- | :---: | :--- | :--- |
| `tarea_id` | `UUID` | No | `FOREIGN KEY REFERENCES tarea(id) ON DELETE CASCADE` | Tarea asignada. |
| `usuario_id` | `UUID` | No | `FOREIGN KEY REFERENCES usuario(id) ON DELETE CASCADE` | Usuario responsable. |

---

## 7. Dominio de Finanzas

### Tabla: `transaccion`
Control absoluto de flujos monetarios de la fundación (Ingresos y Egresos).
*   **Clave Primaria:** `id`

| Columna | Tipo de Dato | Nulo | Claves / Restricciones | Descripción |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `UUID` | No | `PRIMARY KEY` | Identificador de la transacción. |
| `concepto` | `TEXT` | No | - | Glosa o descripción de la transacción. |
| `tipo` | `tipo_transaccion`| No| `ENUM` ('ingreso', 'egreso') | Tipo de flujo financiero. |
| `monto` | `NUMERIC(10,2)`| No | `CHECK (monto > 0.00)` | Cantidad monetaria en USD. |
| `categoria` | `TEXT` | No | `DEFAULT 'otro'` (beca, donacion, operativo, etc.) | Categoría de la transacción. |
| `fecha` | `DATE` | No | `DEFAULT CURRENT_DATE` | Fecha de ejecución de la transacción. |
| `referencia` | `TEXT` | Sí | - | Código de transferencia, cheque o recibo. |
| `notas` | `TEXT` | Sí | - | Observaciones sobre la transacción. |
| `created_at` | `TIMESTAMPTZ`| No | `DEFAULT now()` | Registro en base de datos. |
| `updated_at` | `TIMESTAMPTZ`| No | `DEFAULT now()`, Trigger | Fecha de última edición. |
