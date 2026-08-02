pipeline {
  agent any

  // Opciones del pipeline: Timestamps en logs y tiempo máximo de ejecicon
  options {
    timeout(time: 15, unit: 'MINUTES')
    timestamps()
    ansiColor('xterm')
  }

  // Parametros seleccionabe antes de ejecutar el pipeline
  parameters {
    choice(
      name: 'ENVIRONMENT',
      choices: ['dev', 'stg', 'prd'],
      description: 'Entorno de despliegue objetivo (dev = LocalStack Pro)'
    )
  }

  environment {
    // Variable de entorno inyectada a todos los stage
    PROJECT_NAME = "gestion-deudas-back"
    NODE_ENV = "${params.ENVIRONMENT}"
    PULUMI_CONFIG_PASSPHRASE = "" // Necesario para Pulumi en local/CI
    VAULT_URL = "${params.ENVIRONMENT == 'dev' ? 'http://localhost:8200' : (params.ENVIRONMENT == 'stg' ? 'https://vault.stg.empresa.com:8200' : 'https://vault.prd.empresa.com:8200')}"
  }

  stages {
    // --------------------------------------------------------------
    // STAGE 1: Integracion con Hashicorp vault (Gestion de Secretos)
    // --------------------------------------------------------------
    stage('1. Inyeccion de Secretos desde Vault') {
      steps {
        script {
          echo "Conectando con Hashicorp Vault para obtener credenciales..."

          // Conexion segurda a Vault mediante el plugin de Jenkins
          withVault(
            vaultCredentialId: 'vault-token-id', // 👈 ¡Apunta al Token que creaste en Jenkins!
            vaultSecrets: [[
              path: "secret/data/${env.PROJECT_NAME}/${params.ENVIRONMENT}",
              engineVersion: 2,
              secretValues: [
                [envVar: 'LOCALSTACK_AUTH_TOKEN', vaultKey: 'localstack_auth_token'],
                [envVar: 'AWS_ACCESS_KEY_ID', vaultKey: 'aws_access_key_id'],
                [envVar: 'AWS_SECRET_ACCESS_KEY', vaultKey: 'aws_secret_access_key']
              ]
            ]]
          ) {
            echo "Secretos inyectados correctamente desde Vault."
          }
        }
      }

    }

    // ---------------------------------------------------------
    // STAGE 2: Instalacion de Dependencias y Control de Calidad
    // ---------------------------------------------------------
    stage('2. Verificacion de Codigo y Linter') {
      steps {
        echo "Instalando dependecias de Node.js"
        sh "npm ci"

        echo "Ejecutando verificacion estricta de TypeScript"
        sh "npx tsc --noEmit"

        echo "Ejecutando ESLint..."
        sh "npm run lint"
      }
    }

    // ---------------------------------------------------------
    // STAGE 3: Pruebas Automaticas (Unit Test)
    // ---------------------------------------------------------
    stage('3. Pruebas Unitarias') {
      steps {
        echo "Ejecutando suite de pruebas unitarias..."
        sh 'npm run test -- --passWithNoTests'
      }
    }

    // ---------------------------------------------------------
    // STAGE 4: Despliegue de Infraestructura con Pulumi (laC) 
    // ---------------------------------------------------------
    stage('4. Despliegue Pulumi en LocalStack Pro') {
      steps {
        script {
          echo "Iniciando despliegue declarativo de infraestructura en entorno: ${params.ENVIRONMENT}..."

          // Navegamos a la carpeta de infraestructura
          dir('infra') {
            // 1. Seleccionar el Stack objetivo (dev / stg / prd)
            sh "pulumi stack select ${params.ENVIRONMENT} || pulumi stack init ${params.ENVIRONMENT}"

            // 2. Ejecutar despliegue 100% automatizado sin intervencion manual
            if (params.ENVIRONMENT == 'dev') {
              // En desarrollo local usamos pulumilocal que apunta a LocalStack (puerto 4566)
              sh 'pulumilocal up --yes --non-interactive'
            } else {
              // En staging/prod usamos pulumi apuntando a AWS real
              sh 'pulumi up --yes --non-interactive'
            }
          }
        }
      }
    }
  }

  // ---------------------------------------------------------
  // POST-ACCIONES: Reporte de éxito o falla del pipeline
  // ---------------------------------------------------------
  post {
    success {
      echo "PIPELINE COMPLETADO CON ÉXITO: La infraestructura y microservicios estan operativos."
    }
    failure {
      echo "ERROR EN EL PIPELINE: Revisa los logs anteriores para identificar el fallo."
    }
    always {
      cleanWs() // Limpia el workspace de Jenkins al finalizar
    }
  }
}