pipeline {
  agent any

  environment {
    IMAGE = "inventory-api:${BUILD_NUMBER}"
    CONTAINER = "inventory-api-${BUILD_NUMBER}"
    APP_PORT = "3000"
    HOST_PORT = "3000"
  }

  options {
    buildDiscarder(logRotator(numToKeepStr: '10'))
    timeout(time: 30, unit: 'MINUTES')
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build image') {
      steps {
        echo "Building Docker image ${env.IMAGE}"
        bat "docker --version"
        bat "docker build -t %IMAGE% ."
      }
    }

    stage('Test') {
      steps {
        echo "Running tests inside container"
        // run container temporarily and execute npm test
        bat """
          @echo off
          docker run --rm %IMAGE% cmd /c "npm test"
        """
      }
    }

    stage('Deploy (dev only)') {
      when { branch 'dev' }
      steps {
        echo "Deploying to local host (dev branch) - stop old container and start new one"
        bat """
          @echo off
          REM remove existing by name if exists
          for /f "tokens=*" %%C in ('docker ps -a --filter "name=inventory-api-dev" --format "%%{{.Names}}"') do (
            if "%%C"=="inventory-api-dev" docker rm -f inventory-api-dev || echo remove-failed
          )
          REM remove any container using host port %HOST_PORT%
          for /f "tokens=1" %%I in ('docker ps -a --format "%%{{.ID}} %%{{.Names}} %%{{.Ports}}" ^| findstr /C::%HOST_PORT%->') do (
            echo Removing container %%I that uses port %HOST_PORT%
            docker rm -f %%I || echo rmfailed-%%I
          )
          REM start new container
          docker run -d --name inventory-api-dev -p %HOST_PORT%:%APP_PORT% %IMAGE%
        """
      }
    }
  }

  post {
    success {
      echo "Pipeline SUCCESS"
    }
    failure {
      echo "Pipeline FAILED - collecting diagnostics"
      bat "docker ps -a --format \"table {{.ID}}\\t{{.Names}}\\t{{.Status}}\\t{{.Ports}}\" || echo no-container"
      bat "docker logs inventory-api-dev --tail 200 || echo no-logs"
    }
    always {
      echo "Pipeline finished."
    }
  }
}
