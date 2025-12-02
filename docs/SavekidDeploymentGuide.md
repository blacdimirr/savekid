# Guía de compilación y despliegue SaveKID (Linux)

Esta guía resume los pasos para compilar y desplegar el servidor SaveKID basado en Traccar en un host Linux. Incluye la construcción del backend, la UI (traccar-web), la preparación de la base de datos y la configuración mínima para habilitar el protocolo FA66S y las nuevas APIs.

## 1. Prerrequisitos

- **Java 17** (OpenJDK recomendado)
- **Node.js 18+** y **npm** para construir `traccar-web`
- **Gradle Wrapper** incluido en el proyecto (`./gradlew`)
- **Base de datos**: MySQL 8+ o PostgreSQL 13+
- Herramientas de sistema: `git`, `unzip`, `curl`, `systemd` (para servicio en segundo plano)

## 2. Preparar la base de datos

1. Crear la base de datos y usuario con permisos de lectura/escritura.
2. Configurar el datasource en `./conf/traccar.xml` (copiar desde `setup/traccar.xml` si no existe) con URL, usuario y contraseña.
3. Ejecutar las migraciones Liquibase incluidas en `schema/changelog-master.xml`:
   ```bash
   ./gradlew update
   ```
   El comando aplicará los cambios de esquema, incluyendo las tablas de SaveKID (`savekid_children`, historial fisiológico y relaciones con dispositivos).

## 3. Compilar el backend

1. Desde la raíz del repositorio, ejecutar:
   ```bash
   ./gradlew clean install -x test
   ```
   - Genera el artefacto del servidor en `target/tracker-server.jar`.
   - Omite tests si se requiere una compilación rápida; elimine `-x test` para una verificación completa.

## 4. Configurar el protocolo FA66S

1. Editar `conf/traccar.xml` para agregar el puerto del protocolo si no existe:
   ```xml
   <entry key="fa66s.port">5126</entry>
   ```
2. Reiniciar el servicio para que el listener TCP/UDP del FA66S quede activo.

## 5. Construir la UI (traccar-web)

1. Instalar dependencias:
   ```bash
   cd traccar-web
   npm install
   ```
2. Construir los assets:
   ```bash
   npm run build
   ```
   - El resultado quedará en `traccar-web/dist` o la carpeta configurada por el proyecto.
3. Regresar a la raíz del repo cuando termines:
   ```bash
   cd ..
   ```

## 6. Empaquetar distribución

Si usas el empaquetado estándar de Traccar:
```bash
./gradlew assembleDist -x test
```
El ZIP/arch TAR incluirá el jar, scripts de arranque y la UI precompilada. Puedes extraerlo en `/opt/traccar` o el directorio deseado.

## 7. Despliegue como servicio

1. Copiar el contenido del paquete a `/opt/traccar` (o ruta elegida).
2. Crear/ajustar el servicio systemd `/etc/systemd/system/traccar.service`:
   ```ini
   [Unit]
   Description=Traccar SaveKID Server
   After=network.target

   [Service]
   Type=simple
   WorkingDirectory=/opt/traccar
   ExecStart=/usr/bin/java -jar /opt/traccar/tracker-server.jar conf/traccar.xml
   Restart=on-failure
   User=traccar
   Group=traccar

   [Install]
   WantedBy=multi-user.target
   ```
3. Recargar y habilitar:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable traccar
   sudo systemctl start traccar
   sudo systemctl status traccar
   ```

## 8. Verificación rápida

- Confirmar puertos: `sudo ss -ltnp | grep 5126` para el listener FA66S y `sudo ss -ltnp | grep 8082` para HTTP si usas el puerto por defecto.
- Probar login en la UI web (`http://<host>:8082/`).
- Verificar que `/api/savekid/children` responde con un token válido.

## 9. Actualizaciones posteriores

Para actualizar el servidor:
1. Extraer el nuevo paquete sobre el directorio de instalación (respalda `conf/` y `data/`).
2. Ejecutar `./gradlew update` antes de reiniciar para aplicar migraciones nuevas.
3. Reiniciar el servicio `systemctl restart traccar`.

## 10. Notas operativas

- **Logs**: revisa `logs/tracker-server.log` y `logs/wrapper.log` para depuración.
- **Seguridad**: usa HTTPS detrás de un proxy inverso (nginx/Traefik). Limita accesos a los puertos de protocolo desde la WAN.
- **Respaldos**: agenda backups de la base de datos y de `conf/`.

Con estos pasos el entorno Linux quedará listo para operar las nuevas funciones de SaveKID (protocolos FA66S, gestión de niños y datos fisiológicos).
