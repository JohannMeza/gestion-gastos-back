import * as aws from '@pulumi/aws';
import Constants from '../../contants';

export function createPaymentTable() {
  const tableName = `Prestadeuda_Payments_${Constants.environment}`;

  const paymentTable = new aws.dynamodb.Table(tableName, {
    name: tableName,
    billingMode: 'PAY_PER_REQUEST',
    hashKey: 'PK', // PAYMENT#<paymentId>
    rangeKey: 'SK', // METADATA
    attributes: [
      { name: 'PK', type: 'S' },
      { name: 'SK', type: 'S' },
      { name: 'GSI1PK', type: 'S' },
      { name: 'GSI1SK', type: 'S' },
    ],
    globalSecondaryIndexes: [
      {
        name: 'GSI1-LoanPayments',
        hashKey: 'GSI1PK',
        rangeKey: 'GSI1SK',
        projectionType: 'ALL',
      },
    ],
    tags: {
      Environment: Constants.environment,
      Microservice: 'payment-service',
      ManagedBy: 'Pulumi',
    },
  });

  return paymentTable;
}
