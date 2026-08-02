import * as aws from '@pulumi/aws';
import Constants from '../contants';

export function createEventBus() {
  const busName = `prestadeuda-event-bus-${Constants.environment}`;

  const eventBus = new aws.cloudwatch.EventBus(busName, {
    name: busName,
    tags: {
      Environment: Constants.environment,
      Project: Constants.projectName,
      ManagedBy: 'Pulumi',
    },
  });

  return eventBus;
}
