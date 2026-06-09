pipeline {

    agent any

    environment {
        IMAGE      = "irctc-api-${BUILD_NUMBER}"
        NETWORK    = "irctc-net"
        MYSQL_CONT = "irctc-mysql"
        API_CONT   = "irctc-api"

        MYSQL_PWD  = "rootpassword"
        MYSQL_DB   = "irctc"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                bat 'docker build -t %IMAGE% .'
            }
        }

        stage('Create Network') {
            steps {
                bat 'docker network inspect %NETWORK% >nul 2>&1 || docker network create %NETWORK%'
            }
        }

        stage('Start MySQL') {
            steps {
                bat '''
                docker rm -f %MYSQL_CONT% >nul 2>&1

                docker run -d ^
                  --name %MYSQL_CONT% ^
                  --network %NETWORK% ^
                  -e MYSQL_ROOT_PASSWORD=%MYSQL_PWD% ^
                  -e MYSQL_DATABASE=%MYSQL_DB% ^
                  -p 3307:3306 ^
                  -v mysql-data:/var/lib/mysql ^
                  mysql:8.0
                '''
            }
        }

        stage('Wait For MySQL') {
            steps {
                bat '''
                echo Waiting for MySQL to start...

                :retry
                docker exec %MYSQL_CONT% mysqladmin ping -h localhost -uroot -p%MYSQL_PWD% >nul 2>&1

                if errorlevel 1 (
                    echo MySQL not ready yet...
                    timeout /t 5 >nul
                    goto retry
                )

                echo MySQL is ready.
                '''
            }
        }

        stage('Run API Container') {
            steps {
                bat '''
                docker rm -f %API_CONT% >nul 2>&1

                docker run -d ^
                  --name %API_CONT% ^
                  --network %NETWORK% ^
                  -e ASPNETCORE_ENVIRONMENT=Development ^
                  -e ASPNETCORE_URLS=http://+:8080 ^
                  -e MYSQL_CONNECTION_STRING=Server=%MYSQL_CONT%;Port=3306;Database=%MYSQL_DB%;User=root;Password=%MYSQL_PWD%; ^
                  -e JWT_ISSUER=irctc-api ^
                  -e JWT_AUDIENCE=irctc-clone ^
                  -e JWT_SECRET=change-this-development-secret-at-least-32-characters ^
                  -e JWT_ACCESS_TOKEN_MINUTES=60 ^
                  -e JWT_REFRESH_TOKEN_DAYS=30 ^
                  -e MEDIA_BASE_URL=/media ^
                  -p 5095:8080 ^
                  -v api-media:/app/SimpleStorage ^
                  %IMAGE%
                '''
            }
        }

        stage('Verify Containers') {
            steps {
                bat 'docker ps'
            }
        }
    }

    post {
        success {
            echo 'Deployment completed successfully.'
        }

        failure {
            echo 'Deployment failed.'
            bat 'docker ps -a'
        }
    }
}