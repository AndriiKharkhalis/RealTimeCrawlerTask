import axios from 'axios';
import { ILogger, IMappingsLoader } from '../domain';

export type MappingsLoaderDependencies = {
  logger: ILogger;
};

export type MappingsLoaderOptions = {
  rootPath: string;
};

export class MappingsLoader implements IMappingsLoader {
  private cache: Map<string, string> | null = null;

  constructor(
    private readonly $: MappingsLoaderDependencies,
    private readonly options: MappingsLoaderOptions,
  ) {}

  async fetchMappings(): Promise<Map<string, string>> {
    if (this.cache) {
      return this.cache;
    }

    const mappings = new Map<string, string>();

    try {
      const response = await axios.get(`${this.options.rootPath}/mappings`);

      if (!response.data || typeof response.data.mappings !== 'string') {
        throw new Error('Invalid or missing mappings data in response');
      }

      const data = response.data.mappings.split(';');

      for (const mapping of data) {
        const [key, value] = mapping.split(':');

        if (!key || !value) {
          this.$.logger.warn(`Skipping invalid mapping: ${mapping}`);
          continue;
        }

        if (mappings.has(key)) {
          this.$.logger.warn(`Duplicate key encountered: ${key}`);
          continue;
        }

        mappings.set(key, value);
      }

      this.cache = mappings;
    } catch (error) {
      throw new Error(`Failed to fetch mappings from ${this.options.rootPath}/mappings: ${error.message}`);
    }

    return mappings;
  }

  clearCache(): void {
    this.cache = null;
    this.$.logger.info('Mappings cache cleared.');
  }
}
