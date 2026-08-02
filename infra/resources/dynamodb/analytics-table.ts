import * as aws from '@pulumi/aws';
import Constants from '../../contants';

export function createAnalyticsTable() {
  const tableName = `Prestadeuda_Analytics_${Constants.environment}`;

  const analyticsTable = new aws.dynamodb.Table(tableName, {
    name: tableName,
    billingMode: 'PAY_PER_REQUEST',
    hashKey: 'PK', // METRIC#<metricType>
    rangeKey: 'SK',
    attributes: [
      { name: 'PK', type: 'S' },
      { name: 'SK', type: 'S' },
    ],
    tags: {
      Environment: Constants.environment,
      Microservice: 'analytics-service',
      ManagedBy: 'Pulumi',
    },
  });

  return analyticsTable;
}
