pipeline {
    agent any

    environment {
        IMAGE_NAME = 'pharmalink-web'
        IMAGE_TAG  = "${BUILD_NUMBER}"
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
                sh 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                echo ' Vérification du code...'
                sh 'npm run lint --if-present || true'
            }
        }

        stage('Build') {
            steps {
                echo ' Build de l\'application React...'
                sh 'npm run build'
            }
        }

        stage('Docker Build') {
            steps {
                echo ' Construction de l\'image Docker...'
                sh "docker build -t ${DOCKER_IMAGE} -t ${DOCKER_IMAGE_LATEST} ."
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
                    sh "echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin"
                    sh "docker push ${DOCKER_IMAGE}"
                    sh "docker push ${DOCKER_IMAGE_LATEST}"
                    sh "docker logout"
                }
            }
        }

        stage('Deploy Local') {
            steps {
                echo ' Déploiement local...'
                sh """
                    docker stop pharmalink-web-container || true
                    docker rm pharmalink-web-container || true
                    docker run -d \\
                        --name pharmalink-web-container \\
                        -p 3000:80 \\
                        --restart unless-stopped \\
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
            sh 'docker image prune -f || true'
        }
    }
}