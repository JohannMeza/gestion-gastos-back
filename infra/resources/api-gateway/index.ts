import Constants from '../../../infra/contants';
import * as aws from '@pulumi/aws';

export function createApiGateWay() {
  const apiName = `Prestadeuda-API-${Constants.environment}`;

  // Creare el API Gateway REST principal
  const api = new aws.apigateway.RestApi(apiName, {
    name: apiName,
    description: `API Gateway principal para los microservicios de Prestadeuda (${Constants.environment})`,
    endpointConfiguration: {
      types: 'REGIONAL',
    },
    tags: {
      Environment: Constants.environment,
      MangedBy: 'Pulumi',
    },
  });

  // 2. Ruta Base '/v1
  const v1Resource = new aws.apigateway.Resource('v1-resource', {
    restApi: api.id,
    parentId: api.rootResourceId,
    pathPart: `v1`,
  });

  // 3. Metodo de Prueba (Health Check) GET v1 para permitir el despliegue
  const healMethod = new aws.apigateway.Method('v1-health-method', {
    restApi: api.id,
    resourceId: v1Resource.id,
    httpMethod: 'GET',
    authorization: 'NONE',
  });

  const healthIntegration = new aws.apigateway.Integration(
    'v1-health-integration',
    {
      restApi: api.id,
      resourceId: v1Resource.id,
      httpMethod: healMethod.httpMethod,
      type: 'MOCK',
      requestTemplates: {
        'application/json':
          '{"statusCode": 200, "message": "Prestadeuda API Gateway v1 activa"}',
      },
    },
  );

  // 4. Sub-Ruta '/v1/clients'
  const clientsResource = new aws.apigateway.Resource('clients-resource', {
    restApi: api.id,
    parentId: v1Resource.id,
    pathPart: 'clients',
  });

  // 5. Sub-Ruta 'v1/loans'
  const loansResource = new aws.apigateway.Resource('laons-resource', {
    restApi: api.id,
    parentId: v1Resource.id,
    pathPart: 'loans',
  });

  // 6. Sub-ruta '/v1/payments'
  const paymentResource = new aws.apigateway.Resource('payments-resource', {
    restApi: api.id,
    parentId: v1Resource.id,
    pathPart: 'payments',
  });

  // 7. Sub-Ruta '/v1/analytics'
  const analyticsResource = new aws.apigateway.Resource('analytics-resource', {
    restApi: api.id,
    parentId: v1Resource.id,
    pathPart: 'analytics',
  });

  // 8. Despliegue del API Gateway (Stage dev)
  const deployment = new aws.apigateway.Deployment(
    'api-deployment',
    {
      restApi: api.id,
    },
    {
      dependsOn: [
        healthIntegration,
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
