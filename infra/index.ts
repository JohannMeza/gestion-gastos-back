import { createEventBus } from './resources/eventbridge';
import { createDatabaseTables } from './resources/dynamodb/index';
import { createReceiptsBucket } from './resources/s3/receipts-bucket';
import { createApiGateWay } from './resources/api-gateway';
import Constants from './contants';
import Config from './config';

// 1. Instanciar configuracion global
const appConfig = new Config(Constants);
export const envVars = appConfig.getEnvironmentVariables();

// 2. Crear Recursos Principales
const mainEventBus = createEventBus();
const tables = createDatabaseTables();
const receiptesBucket = createReceiptsBucket();
const apiGateway = createApiGateWay();

// 3. Exportar identificadores para Pulumi & Jenkins
export const environment = Constants.environment;
export const awsRegion = Constants.awsRegion;
export const eventBusName = mainEventBus.name;

// Exportar nombres de tablas Dynamodb creadas
export const clientTableName = tables.clientTable.name;
export const loadTableName = tables.loanTable.name;
export const paymentTableName = tables.paymentTable.name;
export const analyticsTableName = tables.analyticsTable.name;

// Exportar S3 & API Gateway
export const receiptsBucketName = receiptesBucket.id;
export const apiGatewayUrl = apiGateway.stage.invokeUrl;
