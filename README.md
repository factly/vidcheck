# Vidcheck

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

- Vidcheck: [http://127.0.0.1:4455/.factly/vid-check/admin/](http://127.0.0.1:4455/.factly/vid-check/admin/)
- Kavach: [http://127.0.0.1:4455/.factly/kavach/web/auth/login](http://127.0.0.1:4455/.factly/kavach/web/auth/login)


### Stopping the application

- Execute the following command docker-compose command to stop Vidcheck and all the components
  
  ```
    docker-compose down
  ```