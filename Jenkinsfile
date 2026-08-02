pipeline {
    agent any

    // Opciones del pipeline: Timestamps en logs y tiempo máximo de ejecución
    options {
        timeout(time: 15, unit: 'MINUTES')
        timestamps()
    }

    // Parámetros seleccionables antes de ejecutar el pipeline (dev, stg, prd)
    parameters {
        choice(
            name: 'ENVIRONMENT',
            choices: ['dev', 'stg', 'prd'],
            description: 'Entorno de despliegue objetivo (dev = LocalStack Pro)'
        )
    }

    // Triggers automáticos por consulta de SCM / Webhook
    triggers {
        pollSCM('* * * * *')
    }

    environment {
        PROJECT_NAME = "gestion-deudas-back"
        NODE_ENV = "${params.ENVIRONMENT}"
        PULUMI_CONFIG_PASSPHRASE = "" // Necesario para Pulumi en local/CI
    }

    stages {
        // --------------------------------------------------------------
        // STAGE 1: Integración con HashiCorp Vault por Proyecto y Entorno
        // --------------------------------------------------------------
        stage('1. Inyección de Secretos desde Vault') {
            steps {
                script {
                    echo "🔐 Conectando con HashiCorp Vault para el proyecto '${env.PROJECT_NAME}' en entorno '${params.ENVIRONMENT}'..."

                    withVault(vaultSecrets: [[
                        path: "secret/data/${env.PROJECT_NAME}/${params.ENVIRONMENT}",
                        engineVersion: 2,
                        secretValues: [
                            [envVar: 'LOCALSTACK_AUTH_TOKEN', vaultKey: 'localstack_auth_token'],
                            [envVar: 'AWS_ACCESS_KEY_ID', vaultKey: 'aws_access_key_id'],
                            [envVar: 'AWS_SECRET_ACCESS_KEY', vaultKey: 'aws_secret_access_key']
                        ]
                    ]]) {
                        echo "✅ Secretos de Vault para '${env.PROJECT_NAME}/${params.ENVIRONMENT}' inyectados correctamente."
                    }
                }
            }
        }

        // ---------------------------------------------------------
        // STAGE 2: Instalación de Dependencias y Control de Calidad
        // ---------------------------------------------------------
        stage('2. Verificación de Código y Linter') {
            steps {
                echo "📦 Instalando dependencias de Node.js..."
                sh "npm ci"

                echo "🔍 Ejecutando verificación estricta de TypeScript..."
                sh "npx tsc --noEmit"

                echo "🧹 Ejecutando ESLint..."
                sh "npm run lint"
            }
        }

        // ---------------------------------------------------------
        // STAGE 3: Pruebas Automáticas (Unit Test)
        // ---------------------------------------------------------
        stage('3. Pruebas Unitarias') {
            steps {
                echo "🧪 Ejecutando suite de pruebas unitarias..."
                sh 'npm run test -- --passWithNoTests'
            }
        }

        // ---------------------------------------------------------
        // STAGE 4: Despliegue de Infraestructura con Pulumi (IaC) 
        // ---------------------------------------------------------
        stage('4. Despliegue Pulumi en LocalStack Pro') {
            steps {
                script {
                    echo "🚀 Iniciando despliegue declarativo de infraestructura en entorno: ${params.ENVIRONMENT}..."

                    // Navegamos a la carpeta de infraestructura
                    dir('infra') {
                        // 1. Seleccionar el Stack objetivo (dev / stg / prd)
                        sh "pulumi stack select ${params.ENVIRONMENT} || pulumi stack init ${params.ENVIRONMENT}"

                        // 2. Ejecutar despliegue 100% automatizado según el entorno
                        if (params.ENVIRONMENT == 'dev') {
                            // En desarrollo local usamos pulumilocal que apunta a LocalStack (puerto 4566)
                            sh 'pulumilocal up --yes --non-interactive'
                        } else {
                            // En stg/prd usamos pulumi apuntando a AWS real
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
            echo "🎉 PIPELINE COMPLETADO CON ÉXITO: La infraestructura y microservicios están operativos."
        }
        failure {
            echo "❌ ERROR EN EL PIPELINE: Revisa los logs anteriores para identificar el fallo."
        }
        always {
            cleanWs() // Limpia el workspace de Jenkins al finalizar
        }
    }
}