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
  raw: string;
}

export interface ValueDescription {
  name: string;
  description: string;
}
export interface AddRegistryFunctionRequestVariables {
  description: string;
  source: string;
  dependencies: string[];
  tags: string[];
  downloads: string[];
  name: string;
  ownerId: string;
  ownerEmail: string;
  values: ValueDescription[];
}
