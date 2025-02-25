export interface IMappingsLoader {
  fetchMappings(): Promise<Map<string, string>>;
  clearCache(): void;
}
