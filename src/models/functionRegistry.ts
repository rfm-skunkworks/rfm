export interface GraphQLPayload<T> {
  data: T;
}

export interface WrappedRegistryFunction {
  function_registry: RegistryFunction;
}

export interface RegistryFunction {
  _id: string;
  name: string;
  tags: string[];
  ownerId: string;
  downloads: string[];
  dependencies: string[];
  raw: string;
}
