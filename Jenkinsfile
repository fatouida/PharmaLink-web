pipeline {
    agent any

    environment {
        // Nom de l'image Docker
        IMAGE_NAME = 'pharmalink-web'
        IMAGE_TAG  = "${BUILD_NUMBER}"
        // Ton Docker Hub username
        DOCKER_HUB_USER = 'fatouida'
        DOCKER_IMAGE = "${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG}"
        DOCKER_IMAGE_LATEST = "${DOCKER_HUB_USER}/${IMAGE_NAME}:latest"
    }

    tools {
        nodejs 'Node-JS-20'
    }

    stages {

        stage('Checkout') {
            steps {
                echo ' Récupération du code source...'
                checkout scm
            }
        }

        stage('Install') {
            steps {
                echo ' Installation des dépendances...'
                bat 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                echo ' Vérification du code...'
                bat 'npm run lint --if-present'
            }
        }

        stage('Build') {
            steps {
                echo ' Build de l\'application React...'
                bat 'npm run build'
            }
        }

        stage('Docker Build') {
            steps {
                echo ' Construction de l\'image Docker...'
                bat "docker build -t ${DOCKER_IMAGE} -t ${DOCKER_IMAGE_LATEST} ."
            }
        }

        stage('Docker Push') {
            steps {
                echo ' Push vers Docker Hub...'
                withCredentials([usernamePassword(
                    credentialsId: 'docker-hub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    bat "docker login -u %DOCKER_USER% -p %DOCKER_PASS%"
                    bat "docker push ${DOCKER_IMAGE}"
                    bat "docker push ${DOCKER_IMAGE_LATEST}"
                    bat "docker logout"
                }
            }
        }

        stage('Deploy Local') {
            steps {
                echo ' Déploiement local...'
                bat """
                    docker stop pharmalink-web-container 2>nul || echo Container not running
                    docker rm pharmalink-web-container 2>nul || echo Container not found
                    docker run -d ^
                        --name pharmalink-web-container ^
                        -p 3000:80 ^
                        --restart unless-stopped ^
                        ${DOCKER_IMAGE_LATEST}
                """
            }
        }
    }

    post {
        success {
            echo ' Pipeline terminé avec succès !'
            echo " Application disponible sur http://localhost:3000"
            echo " Image Docker : ${DOCKER_IMAGE}"
        }
        failure {
            echo ' Pipeline échoué — vérifier les logs ci-dessus'
        }
        always {
            echo ' Nettoyage des images Docker intermédiaires...'
            bat 'docker image prune -f'
        }
    }
}