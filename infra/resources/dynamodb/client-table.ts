import * as aws from '@pulumi/aws';
import Constants from '../../contants';

export function createClientTable() {
  const tableName = `Prestadeuda_Clients_${Constants.environment}`;

  const clientTable = new aws.dynamodb.Table(tableName, {
    name: tableName,
    billingMode: 'PAY_PER_REQUEST', // Escalamiento y facturación según demanda
    hashKey: 'PK', // Partition Key: CLIENT#<clientId>
    rangeKey: 'SK', // Sort Key:  METADATA
    attributes: [
      { name: 'PK', type: 'S' },
      { name: 'SK', type: 'S' },
      { name: 'GSI1PK', type: 'S' },
      { name: 'GSI1SK', type: 'S' },
    ],
    globalSecondaryIndexes: [
      {
        name: 'GSI1-DocumentSearch',
        hashKey: 'GSI1PK',
        rangeKey: 'GSI1SK',
        projectionType: 'ALL',
      },
    ],
  });

  return clientTable;
}
