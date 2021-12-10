export interface GraphQLPayload<T> {
  data: T;
}

export interface GQLGetAndUpdateFunctionPayload {
  GetAndUpdateFunction: RegistryFunction;
}

export interface GQLInsertOneFunctionPayload {
  insertOneFunction_registry: Partial<RegistryFunction>;
}

export interface GQLDeleteOneFunctionPayload {
  deleteOneFunction_registry: Partial<RegistryFunction>;
}

export interface GQLFindFunctionsPayload {
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
  values: ValueDescription[];
  raw: string;
}

export interface ValueDescription {
  name: string;
  description: string;
}

export interface AddRegistryFunctionRequestVariables {
  name: string;
  description: string;
  tags: string[];
  ownerEmail: string;
  ownerId: string;
  downloads: string[];
  dependencies: string[];
  source: string;
  values: ValueDescription[];
}

export interface RFMConfig {
  functions: RFMFunctions;
}

export interface RFMFunctions {
  [name: string]: FunctionConfig;
}

export interface FunctionConfig {
  values?: ValueDescription[];
}
