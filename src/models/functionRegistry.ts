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
  tags: string[];
  ownerId: string;
  downloads: string[];
  dependencies: string[];
  raw: string;
}

export interface Value {
  name: string;
  description: string;
  value: string;
}

export interface AddRegistryFunctionRequest {
  name: string;
  description: string;
  tags: string[];
  ownerId: string;
  dependencies: string[];
  source: string;
  values: Value[];
}
