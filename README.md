# Vidcheck
## Server
**Releasability:** [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=factly_vidcheck_server&metric=alert_status)](https://sonarcloud.io/dashboard?id=factly_vidcheck_server)  
**Reliability:** [![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=factly_vidcheck_server&metric=reliability_rating)](https://sonarcloud.io/dashboard?id=factly_vidcheck_server) [![Bugs](https://sonarcloud.io/api/project_badges/measure?project=factly_vidcheck_server&metric=bugs)](https://sonarcloud.io/dashboard?id=factly_vidcheck_server)  
**Security:** [![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=factly_vidcheck_server&metric=security_rating)](https://sonarcloud.io/dashboard?id=factly_vidcheck_server) [![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=factly_vidcheck_server&metric=vulnerabilities)](https://sonarcloud.io/dashboard?id=factly_vidcheck_server)  
**Maintainability:** [![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=factly_vidcheck_server&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=factly_vidcheck_server) [![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=factly_vidcheck_server&metric=sqale_index)](https://sonarcloud.io/dashboard?id=factly_vidcheck_server) [![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=factly_vidcheck_server&metric=code_smells)](https://sonarcloud.io/dashboard?id=factly_vidcheck_server)  
**Other:** [![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=factly_vidcheck_server&metric=ncloc)](https://sonarcloud.io/dashboard?id=factly_vidcheck_server) [![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=factly_vidcheck_server&metric=duplicated_lines_density)](https://sonarcloud.io/dashboard?id=factly_vidcheck_server) [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=factly_vidcheck_server&metric=coverage)](https://sonarcloud.io/dashboard?id=factly_vidcheck_server)

## Setting up development environment for Vidcheck

### Pre-requisites

- Currently the setup is only tested for development on Mac OS and Linux
- Install and run Docker and Docker Compose

### Clone the required repositories

- [kavach-server](https://github.com/factly/kavach-server)
- [kavach-web](https://github.com/factly/kavach-web)

```
    git clone https://github.com/factly/kavach-server.git kavach/kavach-server
    git clone https://github.com/factly/kavach-web.git kavach/kavach-web
```

The folder structure after cloning the above repositories should look like the following:

```
    .
    ├── README.md
    ├── docker-compose.yml
    ├── kavach
    ├── kratos
    ├── client
    ├── server
    ├── oathkeeper
    └── pg-init-scripts
```

### Starting the application

- Execute the following command docker-compose command to start Vidcheck

  ```
    docker-compose up
  ```

- When the application is started using docker-compose, a directory with name `factly` will be created at the root level to perisit all the data

### Access the application

Once the application is up and running you should be able to access it using the following urls:

- Vidcheck: [http://127.0.0.1:4455/.factly/vid-check/web/](http://127.0.0.1:4455/.factly/vid-check/web/)
- Kavach: [http://127.0.0.1:4455/.factly/kavach/web/auth/login](http://127.0.0.1:4455/.factly/kavach/web/auth/login)

### Stopping the application

- Execute the following command docker-compose command to stop Vidcheck and all the components

  ```
    docker-compose down
  ```

### Env files to be added

- Create a file `.env.development.local` in `/client` and add the following values
  ```
  REACT_APP_BASE_API_URL=http://127.0.0.1:4455/.factly/vid-check/server/
  REACT_APP_PUBLIC_URL=http://127.0.0.1:4455/.factly/vid-check/web/
  ```

- Create config file with name config (and extension .env, .yml, .json) in `server/` and add cnofig variables (eg. below)
```
DATABASE_HOST=postgres 
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=vidcheck 
DATABASE_PORT=5432 
DATABASE_SSL_MODE=disable

KAVACH_URL=http://kavach-server:8000

DEGA_INTEGRATION=false
DEGA_URL=http://dega-server:8000
```