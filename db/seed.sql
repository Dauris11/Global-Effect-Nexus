-- ================================================================
-- GLOBAL EFFECT NEXUS — SEMBRADO INICIAL (SEED)
-- Motor: PostgreSQL 17 (Supabase)
-- Ejecutar DESPUÉS de aplicar todas las migraciones (0001–0012).
-- Idempotente: usa ON CONFLICT para poder re-ejecutarse.
-- ================================================================

-- ================================================================
-- 1. ROLES INSTITUCIONALES
-- ================================================================
INSERT INTO rol (id, nombre, descripcion) VALUES
  ('441d3b24-9b2f-4b08-8f8e-a9b09db4d952', 'super_admin',  'Acceso absoluto a configuración, auditoría y todos los datos del sistema.'),
  ('0398bbdf-807d-411a-85d7-b8478d1fb52c', 'admin',        'Administración general operativa de la fundación y sus módulos.'),
  ('c34ab7f3-ef5a-471a-85b3-3a5f8b5490a1', 'docente',      'Portal docente: gestiona cursos técnicos y registra calificaciones.'),
  ('d1ba6b9d-5a8b-49ef-871d-55cfb14798ef', 'estudiante',   'Portal estudiantil: revisa notas, materias y solicita citas.'),
  ('a5b67c8d-9e0f-41ba-bc3a-96947e4b5a2d', 'psicologo',    'Portal de psicología: expedientes y notas de seguimiento confidenciales.'),
  ('f7e8a9b0-c1d2-43e4-85f6-7b89c0d1e2f3', 'contabilidad', 'Gestión contable, transacciones, aportes y reportes financieros.')
ON CONFLICT (nombre) DO UPDATE SET descripcion = EXCLUDED.descripcion;

-- ================================================================
-- 2. PERMISOS GRANULARES POR MÓDULO
-- ================================================================
INSERT INTO permiso (id, codigo, descripcion) VALUES
  -- Expedientes
  ('e1a1b1c1-1111-2222-3333-444455556666', 'expedientes.leer',        'Visualizar el listado y detalle de expedientes estudiantiles.'),
  ('e1a1b1c1-2222-2222-3333-444455556666', 'expedientes.escribir',    'Crear y modificar expedientes estudiantiles.'),
  ('e1a1b1c1-3333-2222-3333-444455556666', 'expedientes.eliminar',    'Eliminar expedientes estudiantiles del sistema.'),
  -- Académico
  ('a2a2b2c2-1111-2222-3333-444455556666', 'academico.leer',          'Visualizar materias, cursos y períodos académicos.'),
  ('a2a2b2c2-2222-2222-3333-444455556666', 'academico.escribir',      'Crear y modificar materias y cursos técnicos.'),
  ('a2a2b2c2-3333-2222-3333-444455556666', 'calificaciones.registrar','Registrar notas de cursos académicos.'),
  -- Patrocinadores y becas
  ('f3f3b3c3-1111-2222-3333-444455556666', 'patrocinadores.leer',     'Visualizar patrocinadores y aportes.'),
  ('f3f3b3c3-2222-2222-3333-444455556666', 'patrocinadores.escribir', 'Crear y modificar patrocinadores y asignaciones de becas.'),
  -- Finanzas
  ('f4f4b4c4-1111-2222-3333-444455556666', 'finanzas.leer',           'Visualizar transacciones, balances y reportes financieros.'),
  ('f4f4b4c4-2222-2222-3333-444455556666', 'finanzas.escribir',       'Registrar ingresos, egresos y categorías de transacción.'),
  -- Psicología (acceso estricto)
  ('b5b5b5c5-1111-2222-3333-444455556666', 'psicologia.leer',         'Ver citas y notas confidenciales de sesiones psicológicas.'),
  ('b5b5b5c5-2222-2222-3333-444455556666', 'psicologia.escribir',     'Agendar citas y redactar notas de evolución psicológica.'),
  -- Operaciones
  ('d6d6b6c6-1111-2222-3333-444455556666', 'operaciones.leer',        'Visualizar proyectos, tareas y calendario institucional.'),
  ('d6d6b6c6-2222-2222-3333-444455556666', 'operaciones.escribir',    'Crear proyectos, asignar tareas y agendar eventos.'),
  -- Configuración / usuarios
  ('c7c7b7c7-1111-2222-3333-444455556666', 'usuarios.administrar',    'Invitar, activar/desactivar usuarios y asignar roles y permisos.'),
  -- Inteligencia Artificial
  ('a8a8b8c8-1111-2222-3333-444455556666', 'ia.usar',                 'Usar los asistentes de IA (chat interno / estudiantil, OCR).'),
  ('a8a8b8c8-2222-2222-3333-444455556666', 'ia.administrar',          'Configurar la base de conocimiento y parámetros de la IA.')
ON CONFLICT (codigo) DO UPDATE SET descripcion = EXCLUDED.descripcion;

-- ================================================================
-- 3. ASIGNACIÓN DE PERMISOS A ROLES
-- ================================================================
DELETE FROM rol_permiso;

-- SUPER ADMIN: todos los permisos
INSERT INTO rol_permiso (rol_id, permiso_id)
SELECT '441d3b24-9b2f-4b08-8f8e-a9b09db4d952', id FROM permiso;

-- ADMIN: operación general (sin psicología confidencial ni admin de IA)
INSERT INTO rol_permiso (rol_id, permiso_id) VALUES
  ('0398bbdf-807d-411a-85d7-b8478d1fb52c', 'e1a1b1c1-1111-2222-3333-444455556666'),
  ('0398bbdf-807d-411a-85d7-b8478d1fb52c', 'e1a1b1c1-2222-2222-3333-444455556666'),
  ('0398bbdf-807d-411a-85d7-b8478d1fb52c', 'a2a2b2c2-1111-2222-3333-444455556666'),
  ('0398bbdf-807d-411a-85d7-b8478d1fb52c', 'a2a2b2c2-2222-2222-3333-444455556666'),
  ('0398bbdf-807d-411a-85d7-b8478d1fb52c', 'f3f3b3c3-1111-2222-3333-444455556666'),
  ('0398bbdf-807d-411a-85d7-b8478d1fb52c', 'f3f3b3c3-2222-2222-3333-444455556666'),
  ('0398bbdf-807d-411a-85d7-b8478d1fb52c', 'd6d6b6c6-1111-2222-3333-444455556666'),
  ('0398bbdf-807d-411a-85d7-b8478d1fb52c', 'd6d6b6c6-2222-2222-3333-444455556666'),
  ('0398bbdf-807d-411a-85d7-b8478d1fb52c', 'a8a8b8c8-1111-2222-3333-444455556666');  -- ia.usar

-- DOCENTE
INSERT INTO rol_permiso (rol_id, permiso_id) VALUES
  ('c34ab7f3-ef5a-471a-85b3-3a5f8b5490a1', 'a2a2b2c2-1111-2222-3333-444455556666'),
  ('c34ab7f3-ef5a-471a-85b3-3a5f8b5490a1', 'a2a2b2c2-3333-2222-3333-444455556666'),
  ('c34ab7f3-ef5a-471a-85b3-3a5f8b5490a1', 'd6d6b6c6-1111-2222-3333-444455556666');

-- ESTUDIANTE
INSERT INTO rol_permiso (rol_id, permiso_id) VALUES
  ('d1ba6b9d-5a8b-49ef-871d-55cfb14798ef', 'a2a2b2c2-1111-2222-3333-444455556666'),
  ('d1ba6b9d-5a8b-49ef-871d-55cfb14798ef', 'a8a8b8c8-1111-2222-3333-444455556666');  -- ia.usar (chat estudiantil)

-- PSICÓLOGO
INSERT INTO rol_permiso (rol_id, permiso_id) VALUES
  ('a5b67c8d-9e0f-41ba-bc3a-96947e4b5a2d', 'e1a1b1c1-1111-2222-3333-444455556666'),
  ('a5b67c8d-9e0f-41ba-bc3a-96947e4b5a2d', 'b5b5b5c5-1111-2222-3333-444455556666'),
  ('a5b67c8d-9e0f-41ba-bc3a-96947e4b5a2d', 'b5b5b5c5-2222-2222-3333-444455556666'),
  ('a5b67c8d-9e0f-41ba-bc3a-96947e4b5a2d', 'd6d6b6c6-1111-2222-3333-444455556666');

-- CONTABILIDAD
INSERT INTO rol_permiso (rol_id, permiso_id) VALUES
  ('f7e8a9b0-c1d2-43e4-85f6-7b89c0d1e2f3', 'f3f3b3c3-1111-2222-3333-444455556666'),
  ('f7e8a9b0-c1d2-43e4-85f6-7b89c0d1e2f3', 'f4f4b4c4-1111-2222-3333-444455556666'),
  ('f7e8a9b0-c1d2-43e4-85f6-7b89c0d1e2f3', 'f4f4b4c4-2222-2222-3333-444455556666');

-- ================================================================
-- 4. USUARIO ADMINISTRADOR MAESTRO
-- Email: admin@globaleffect.org   Password: admin123 (bcrypt)
-- ================================================================
INSERT INTO usuario (id, email, password_hash, nombre, idioma, activo, rol_id) VALUES
  ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'admin@globaleffect.org',
   '$2y$10$tZ26mU7e324gBv1u1rWzKujF7aYQ2h5mQn85YlFp8K19GvR6Y3f2a',
   'Administrador Global Effect', 'es', TRUE,
   '441d3b24-9b2f-4b08-8f8e-a9b09db4d952')
ON CONFLICT (email) DO UPDATE SET rol_id = EXCLUDED.rol_id, activo = EXCLUDED.activo;

-- ================================================================
-- 5. PERÍODOS ACADÉMICOS
-- ================================================================
INSERT INTO periodo (id, nombre, fecha_inicio, fecha_fin, estado) VALUES
  ('e3b0c442-98fc-1c14-9afb-f389a94dec93', '2026-I',  '2026-01-07', '2026-04-28', 'activo'),
  ('d8a3f81e-128a-4c28-984e-336785b9b2ff', '2026-II', '2026-05-05', '2026-08-25', 'planificado')
ON CONFLICT (nombre) DO UPDATE SET estado = EXCLUDED.estado;

-- ================================================================
-- 6. MATERIAS Y CURSOS DE PRUEBA
-- ================================================================
INSERT INTO materia (id, nombre, codigo, descripcion, periodo_id, creditos, profesor_nombre, estado, horario, aula) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Introducción al Liderazgo', 'LID-101', 'Fundamentos de liderazgo y programa Habitudes.', 'e3b0c442-98fc-1c14-9afb-f389a94dec93', 3, 'Roberto Gómez', 'activa', 'Lunes 09:00 - 11:30', 'Aula A-1'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Inglés como Segundo Idioma (Básico)', 'ENG-101', 'Desarrollo de lectura y habla.', 'e3b0c442-98fc-1c14-9afb-f389a94dec93', 4, 'Sarah Jenkins', 'activa', 'Martes y Jueves 14:00 - 16:00', 'Lab 2')
ON CONFLICT DO NOTHING;

INSERT INTO curso (id, nombre, descripcion, docente, periodo_id, estado, capacidad, inscritos, horario, modalidad) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', 'Técnico en Contabilidad y Finanzas', 'Contabilidad básica y análisis financiero.', 'Ana Santana', 'e3b0c442-98fc-1c14-9afb-f389a94dec93', 'activo', 25, 0, 'Sábados 08:00 - 13:00', 'presencial'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Técnico en Computación y Soporte', 'Instalación de software, hardware y redes básicas.', 'Carlos Reyes', 'e3b0c442-98fc-1c14-9afb-f389a94dec93', 'activo', 20, 0, 'Miércoles 18:00 - 21:00', 'mixto')
ON CONFLICT DO NOTHING;

-- ================================================================
-- 7. PATROCINADOR DE PRUEBA
-- ================================================================
INSERT INTO patrocinador (id, nombre, tipo, email, telefono, pais, estado, monto_mensual, notas) VALUES
  ('330e8400-e29b-41d4-a716-446655440005', 'Hope Foundation US', 'ong', 'contact@hopefoundation.org', '+1 555-019-2834', 'Estados Unidos', 'activo', 250.00, 'Patrocina el programa de becas universitarias.')
ON CONFLICT DO NOTHING;
