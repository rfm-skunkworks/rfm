export interface GraphQLPayload<T> {
  data: T;
}

export interface WrappedRegistryFunction {
  function_registry: RegistryFunction;
}

export interface WrappedInsertOneRegistryFunction {
  insertOneFunction_registry: Partial<RegistryFunction>;
}

export interface WrappedRegistryFunctions {
  function_registries: Array<RegistryFunction>;
}

export interface RegistryFunction {
  _id: string;
  name: string;
  description: string;
  tags: string[];
  ownerId: string;
  downloads: string[];
  dependencies: string[];
  secrets: string[];
  raw: string;
}

export interface RFMConfig {
  functions: RFMFunctions;
}

export interface RFMFunctions {
  [name: string]: FunctionConfig;
}

export interface FunctionConfig {
  secrets?: string[];
}
