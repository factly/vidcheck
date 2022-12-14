---
sidebar_position: 2
---

# Installation

## Using Docker Compose

Docker Compose is the easiest way to install and get started with VidCheck on your system locally. 

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

### Env file to be added

- Create config file with name config (and extension .env, .yml, .json) in `server/` and add cnofig variables (eg. below)
    ```
    DATABASE_HOST=postgres 
    DATABASE_USER=postgres
    DATABASE_PASSWORD=postgres
    DATABASE_NAME=vidcheck 
    DATABASE_PORT=5432 
    DATABASE_SSL_MODE=disable

    KETO_URL=http://keto:4466
    KAVACH_URL=http://kavach-server:8000
    OATHKEEPER_HOST=oathkeeper:4455
    KRATOS_PUBLIC_URL=http://kratos:4433
    DEGA_URL=http://dega-server:8000
    DEGA_INTEGRATION=false

    IFRAMELY_URL=http://iframely:8061
    MEILI_KEY=password
    MEILI_URL=http://meilisearch:7700
    IMAGEPROXY_URL=http://127.0.0.1:7001

    TEMPLATES_PATH=web/templates/*

    SUPER_ORGANISATION_TITLE='VidCheck Administration'
    DEFAULT_NUMBER_OF_MEDIA=10
    DEFAULT_NUMBER_OF_SPACES=2
    DEFAULT_NUMBER_OF_VIDEOS=10
    CREATE_SUPER_ORGANISATION=true
    DEFAULT_USER_EMAIL=admin@vidcheck.com
    DEFAULT_USER_PASSWORD=2ssad32sadADSd@!@4
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