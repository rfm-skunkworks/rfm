import axios from "axios";
import {
  AddRegistryFunctionRequestVariables,
  GQLGetAndUpdateFunctionPayload,
  GraphQLPayload,
  RegistryFunction,
  GQLInsertOneFunctionPayload,
  GQLFindFunctionsPayload,
  GQLDeleteOneFunctionPayload,
} from "models/functionRegistry";
import Realm from "realm";
import chalk from "chalk";

export class RealmAppSingleton {
  static instance: Realm.App;

  constructor() {
    console.log("cannot re-instantiate singleton");
  }

  public static get(): Realm.App {
    if (!RealmAppSingleton.instance) {
      const REALM_CLIENT_APP_ID = process.env.REALM_CLIENT_APP_ID || "";
      const appConfig = {
        id: REALM_CLIENT_APP_ID,
        timeout: 10000,
      };

      RealmAppSingleton.instance = new Realm.App(appConfig);
    }
    return RealmAppSingleton.instance;
  }
}

const _makeRealmGraphQLRequest = <T>(
  query: string,
  variables?: Record<string, any>
) => {
  const realmGraphQLUrl = process.env.REALM_GQL_URL || "";
  const apiKey = RegistryClient.getAPIKey();

  return axios.post<GraphQLPayload<T>>(
    realmGraphQLUrl,
    {
      query,
      variables,
    },
    {
      headers: {
        apiKey,
      },
    }
  );
};

export class RegistryClient {
  static getAPIKey(): string {
    return process.env.REALM_API_KEY || "";
  }

  static async downloadFunction(name: string): Promise<RegistryFunction> {
    const res = await _makeRealmGraphQLRequest<GQLGetAndUpdateFunctionPayload>(
      `
    mutation GetAndUpdateFunction($name: String!) {
      GetAndUpdateFunction(input: {name: $name}) {
          _id
          name
          raw
          dependencies
          downloads
          tags
          description
          values {
            name
            description
          }
        }
      }
    `,
      { name }
    );

    const axiosData = res.data;
    const gqlData = axiosData.data;
    return gqlData.GetAndUpdateFunction;
  }

  static async pushFunction(
    variables: AddRegistryFunctionRequestVariables
  ): Promise<string | undefined> {
    const res = await _makeRealmGraphQLRequest<GQLInsertOneFunctionPayload>(
      `mutation InsertOneFunctionMutation(
          $name: String!,
          $description: String!,
          $source: String!,
          $ownerId: ObjectId!,
          $ownerEmail: String!,
          $tags: [String]!,
          $dependencies: [String]!
          $downloads: [String]!
          $values: [Function_registryValueInsertInput]!,
        ) {
          insertOneFunction_registry(data: {
            name: $name,
            description: $description,
            raw: $source,
            owner_id: $ownerId,
            owner_email: $ownerEmail,
            tags: $tags,
            dependencies: $dependencies,
            values: $values,
            downloads: $downloads,
          }) {
            _id
          }
        }`,
      variables
    );

    const axiosData = res.data;
    const gqlData = axiosData.data;
    const { _id } = gqlData.insertOneFunction_registry;
    return _id;
  }

  static async getOwnedFunctions(
    ownerId: string
  ): Promise<Array<RegistryFunction>> {
    const res = await _makeRealmGraphQLRequest<GQLFindFunctionsPayload>(
      `
      query SearchFunctionsByOwner(
        $ownerId: ObjectId!
      ) {
        function_registries(query: {
          owner_id: $ownerId
        }) {
          _id
          name
          description
          downloads
        }
      }
      `,
      { ownerId }
    );
    const axiosData = res.data;
    const gqlData = axiosData.data;
    if (!gqlData) {
      return [];
    }
    return gqlData.function_registries;
  }

  static async searchFunctions(
    name: string,
    tags: Array<string>
  ): Promise<Array<RegistryFunction>> {
    const res = await _makeRealmGraphQLRequest<GQLFindFunctionsPayload>(
      `
      query SearchFunctions(
        $name: String!,
        $tags: [String]!
      ) {
        function_registries(query: {
         OR: [
           {name: $name},
           {tags_in: $tags}
          ]
        }) {
          _id
          name
          raw
          dependencies
          downloads
          tags
          description
        }
      }
      `,
      { name, tags }
    );
    const axiosData = res.data;
    const gqlData = axiosData.data;
    if (!gqlData) {
      return [];
    }
    return gqlData.function_registries;
  }

  static async deleteFunction(ownerId: string, functionName: string) {
    const res = await _makeRealmGraphQLRequest<GQLDeleteOneFunctionPayload>(
      `
      mutation DeleteFunction(
        $ownerId: ObjectId!,
        $functionName: String!
      ) {
        deleteOneFunction_registry(query: {
          owner_id: $ownerId,
          name: $functionName 
        }) {
          _id
          name
          description
          dependencies
          values {
            name
            description
          }
          tags
          raw
        }
      }
      `,
      { functionName, ownerId }
    );
    const axiosData = res.data;
    const gqlData = axiosData.data;
    if (!gqlData) {
      return {};
    }
    return gqlData.deleteOneFunction_registry;
  }

  static async findFunctionNames(): Promise<Set<string>> {
    const res = await _makeRealmGraphQLRequest<GQLFindFunctionsPayload>(
      `
      query {
          function_registries(query: {}) {
            name
          }
      }
      `
    );
    const axiosData = res.data;
    const gqlData = axiosData.data;
    if (!gqlData) {
      return new Set();
    }
    let names: Set<string> = new Set();
    gqlData.function_registries.forEach((func) => {
      names.add(func.name);
    });
    return names;
  }
}

export async function loginWithEmail(
  email: string,
  password: string
): Promise<boolean> {
  const app = RealmAppSingleton.get();
  try {
    const credentials = Realm.Credentials.emailPassword(email, password);

    const user = await app.logIn(credentials);
    if (user) {
      console.log(chalk.greenBright("You have successfully logged in"));
      return true;
    } else {
      console.log(chalk.redBright("There was an error logging you in"));
      return false;
    }
  } catch (err) {
    console.log(chalk.redBright(`Error: ${err}`));
    return false;
  }
}

export async function registerWithEmail(
  email: string,
  password: string
): Promise<boolean> {
  const app = RealmAppSingleton.get();
  try {
    await app.emailPasswordAuth.registerUser({
      email,
      password,
    });
    const credentials = Realm.Credentials.emailPassword(email, password);
    const user = await app.logIn(credentials);
    if (user) {
      console.log(
        chalk.greenBright(
          "You have successfully created a new Realm user and are now logged in"
        )
      );
      return true;
    } else {
      console.log(
        chalk.redBright("There was an error registering the new user account")
      );
      return false;
    }
  } catch (err) {
    console.log(chalk.redBright(`Error: ${err}`));
    return false;
  }
}

export async function logout(): Promise<boolean> {
  const app = RealmAppSingleton.get();
  let user = app.currentUser;
  if (user === null) {
    return false;
  }
  await user.logOut();
  return !user.isLoggedIn;
}
