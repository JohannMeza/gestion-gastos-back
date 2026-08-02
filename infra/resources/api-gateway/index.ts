import Constants from '../../../infra/contants';
import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';

export function createApiGateWay() {
  const apiName = `Prestadeuda-API-${Constants.environment}`;

  // 1. Crear el API Gateway REST principal
  const api = new aws.apigateway.RestApi(apiName, {
    name: apiName,
    description: `API Gateway principal para los microservicios de Prestadeuda (${Constants.environment})`,
    endpointConfiguration: {
      types: 'REGIONAL',
    },
    tags: {
      Environment: Constants.environment,
      ManagedBy: 'Pulumi',
    },
  });

  // 2. Ruta Base '/v1'
  const v1Resource = new aws.apigateway.Resource('v1-resource', {
    restApi: api.id,
    parentId: api.rootResourceId,
    pathPart: 'v1',
  });

  // 3. Método GET en /v1
  const healthMethod = new aws.apigateway.Method('v1-health-method', {
    restApi: api.id,
    resourceId: v1Resource.id,
    httpMethod: 'GET',
    authorization: 'NONE',
  });

  // 4. Integración MOCK para la respuesta de prueba
  const healthIntegration = new aws.apigateway.Integration(
    'v1-health-integration',
    {
      restApi: api.id,
      resourceId: v1Resource.id,
      httpMethod: healthMethod.httpMethod,
      type: 'MOCK',
      requestTemplates: {
        'application/json': '{"statusCode": 200}',
      },
    },
  );

  // 5. Declaración de Respuesta de Método (Method Response HTTP 200)
  const healthMethodResponse = new aws.apigateway.MethodResponse(
    'v1-health-method-response',
    {
      restApi: api.id,
      resourceId: v1Resource.id,
      httpMethod: healthMethod.httpMethod,
      statusCode: '200',
    },
  );

  // 6. Mapeo de Respuesta de Integración (Integration Response HTTP 200 JSON con selectionPattern)
  const healthIntegrationResponse = new aws.apigateway.IntegrationResponse(
    'v1-health-integration-response',
    {
      restApi: api.id,
      resourceId: v1Resource.id,
      httpMethod: healthMethod.httpMethod,
      statusCode: healthMethodResponse.statusCode,
      selectionPattern: '', // Default output mapping para MOCK 200
      responseTemplates: {
        'application/json':
          '{"statusCode": 200, "message": "Prestadeuda API Gateway v1 activa"}',
      },
    },
    { dependsOn: [healthIntegration, healthMethodResponse] },
  );

  // 7. Sub-Rutas de Microservicios
  const clientsResource = new aws.apigateway.Resource('clients-resource', {
    restApi: api.id,
    parentId: v1Resource.id,
    pathPart: 'clients',
  });

  const loansResource = new aws.apigateway.Resource('loans-resource', {
    restApi: api.id,
    parentId: v1Resource.id,
    pathPart: 'loans',
  });

  const paymentResource = new aws.apigateway.Resource('payments-resource', {
    restApi: api.id,
    parentId: v1Resource.id,
    pathPart: 'payments',
  });

  const analyticsResource = new aws.apigateway.Resource('analytics-resource', {
    restApi: api.id,
    parentId: v1Resource.id,
    pathPart: 'analytics',
  });

  // 8. Despliegue del API Gateway (Stage dev con forzado de rediferenciación)
  const deployment = new aws.apigateway.Deployment(
    'api-deployment-v2',
    {
      restApi: api.id,
      triggers: {
        redeployment: pulumi
          .all([
            healthIntegrationResponse.id,
            healthIntegration.id,
            healthMethod.id,
          ])
          .apply(([ir, i, m]) => JSON.stringify({ ir, i, m })),
      },
    },
    {
      dependsOn: [
        healthIntegrationResponse,
        clientsResource,
        loansResource,
        paymentResource,
        analyticsResource,
      ],
    },
  );

  const stage = new aws.apigateway.Stage('api-stage', {
    restApi: api.id,
    deployment: deployment.id,
    stageName: Constants.environment,
  });

  return {
    api,
    stage,
    resources: {
      clientsResource,
      loansResource,
      paymentResource,
      analyticsResource,
    },
  };
}
