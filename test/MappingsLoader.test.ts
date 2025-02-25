import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { logger, MappingsLoader } from '../src/infra';

vi.mock('axios');

describe('MappingsLoader', () => {
  let mappingsLoader: MappingsLoader;

  beforeEach(() => {
    mappingsLoader = new MappingsLoader({ logger }, { rootPath: 'http://localhost:3000/mappings' });

    vi.resetAllMocks();
  });

  it('should throw error when mappings data is invalid', async () => {
    const mockResponse = {
      data: {},
    };

    (axios.get as any).mockResolvedValue(mockResponse);

    await expect(mappingsLoader.fetchMappings()).rejects.toThrow(
      'Invalid or missing mappings data in response',
    );
  });

  it('should skip invalid mappings', async () => {
    const mockResponse = {
      data: {
        mappings: 'key1:value1;key2',
      },
    };

    (axios.get as any).mockResolvedValue(mockResponse);

    const result = await mappingsLoader.fetchMappings();

    expect(result).toEqual(new Map([['key1', 'value1']]));
  });

  it('should skip duplicate keys', async () => {
    const mockResponse = {
      data: {
        mappings: 'key1:value1;key1:value2',
      },
    };

    const output = new Map([['key1', 'value1']]);

    (axios.get as any).mockResolvedValue(mockResponse);

    const result = await mappingsLoader.fetchMappings();

    expect(result).toEqual(output);
  });

  it('should fetch mappings', async () => {
    const mockResponse = {
      data: {
        mappings: 'key1:value1;key2:value2',
      },
    };

    (axios.get as any).mockResolvedValue(mockResponse);

    const result = await mappingsLoader.fetchMappings();

    expect(result).toEqual(
      new Map([
        ['key1', 'value1'],
        ['key2', 'value2'],
      ]),
    );
  });
});
