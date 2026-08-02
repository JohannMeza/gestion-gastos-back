import * as pulumi from '@pulumi/pulumi';

export default class Constants {
  private static configs: Record<string, pulumi.Config> = {};

  /**
   * Obtiene o instancia la configuracion de Pulumi para un espacio de nombres (namespace)
   */
  private static getConfig(namespace: string): pulumi.Config {
    if (!this.configs[namespace]) {
      this.configs[namespace] = new pulumi.Config(namespace);
    }

    return this.configs[namespace];
  }

  // Region de AWS por defecto (ejemplo: us-east-1)
  static get awsRegion(): string {
    return this.getConfig('aws').require('region');
  }

  // Nombre del Stack activo (ej: dev, staging, prod)
  static get environment(): string {
    return pulumi.getStack();
  }

  // Nombre del proyecto principal
  static get projectName(): string {
    return pulumi.getProject();
  }
}
