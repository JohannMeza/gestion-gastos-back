import * as aws from '@pulumi/aws';
import Constants from '../../contants';

export function createReceiptsBucket() {
  const bucketName = `prestadeuda-receipts-${Constants.environment}`;

  const receiptsBucket = new aws.s3.Bucket(bucketName, {
    bucket: bucketName,
    // Permite eliminacion de objetos al destrir el stack en desarrollo
    forceDestroy: Constants.environment === 'dev',
    tags: {
      Environment: Constants.environment,
      Microservice: 'payment-service',
      ManagedBy: 'Pulumi',
    },
  });

  // Configuracion de reglas CORS para permitir solicitudes del Frontend
  new aws.s3.BucketCorsConfiguration(`${bucketName}-cors`, {
    bucket: receiptsBucket.id,
    corsRules: [
      {
        allowedHeaders: ['*'],
        allowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
        allowedOrigins: ['http://localhost:3000', 'http://localhost:5173'],
        maxAgeSeconds: 3000,
      },
    ],
  });

  return receiptsBucket;
}
