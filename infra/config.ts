import * as pulumi from '@pulumi/pulumi';
import Constants from './contants';

export default class Config {
  constructor(private readonly constants: typeof Constants) {}

  getEnvironmentVariables(): Record<string, pulumi.Input<string>> {
    return {
      NODE_ENV: process.env.NODE_ENV || 'dev',
      APP_STAGE: this.constants.environment,
      AWS_REGION: this.constants.awsRegion,
      // Endpoint de LocalStack para desarrllo local
      LOCALSTACK_ENDPOINT:
        process.env.LOCALSTACK_ENDPOINT || 'http://localhost:4566',
    };
  }
}
