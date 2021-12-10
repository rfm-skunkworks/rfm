import axios from "axios";
import {
  AddRegistryFunctionRequestVariables,
  GQLGetAndUpdateFunctionPayload,
  GraphQLPayload,
  RegistryFunction,
  GQLInsertOneFunctionPayload,
  GQLFindFunctionsPayload,
} from "models/functionRegistry";
import Realm from "realm";

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

  static async searchFunctions(
    name: string,
    tags: Array<string>
  ): Promise<Array<RegistryFunction>> {
    const realmGraphQLUrl = process.env.REALM_GQL_URL || "";
    const apiKey = RegistryClient.getAPIKey();

    const res = await axios.post<GraphQLPayload<GQLFindFunctionsPayload>>(
      realmGraphQLUrl,
      {
        query: `
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
        variables: { name, tags },
      },
      {
        headers: {
          apiKey,
        },
      }
    );

    const axiosData = res.data;
    const gqlData = axiosData.data;
    if (!gqlData) {
      return [];
    }
    return gqlData.function_registries;
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
      console.log("You have successfully logged in");
      return true;
    } else {
      console.log("There was an error logging you in");
      return false;
    }
  } catch (err) {
    console.log(err);
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
        "You have successfully created a new Realm user and are now logged in."
      );
      return true;
    } else {
      console.log("There was an error registering the new user account.");
      return false;
    }
  } catch (err) {
    console.log(err);
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
