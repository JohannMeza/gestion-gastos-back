import * as aws from '@pulumi/aws';
import Constants from '../../contants';

export function createLoanTable() {
  const tableName = `Prestadeuda_Loans_${Constants.environment}`;

  const loadTable = new aws.dynamodb.Table(tableName, {
    name: tableName,
    billingMode: 'PAY_PER_REQUEST',
    hashKey: 'PK', // LOAN#<loadId>
    rangeKey: 'SK', // METADATA | INSTALLMENT#<number>
    attributes: [
      { name: 'PK', type: 'S' },
      { name: 'SK', type: 'S' },
      { name: 'GSI1PK', type: 'S' },
      { name: 'GSI1SK', type: 'S' },
      { name: 'GSI2PK', type: 'S' },
      { name: 'GSI2SK', type: 'S' },
    ],
    globalSecondaryIndexes: [
      {
        name: 'GSI1-ClientLoans',
        hashKey: 'GSI1PK',
        rangeKey: 'GSI1SK',
        projectionType: 'ALL',
      },
      {
        name: 'GSI2-OverdueSearch',
        hashKey: 'GSI2PK',
        rangeKey: 'GSI2SK',
        projectionType: 'ALL',
      },
    ],
    tags: {
      Environment: Constants.environment,
      Microservice: 'loan-service',
      ManagedBy: 'Pulumi',
    },
  });

  return loadTable;
}
