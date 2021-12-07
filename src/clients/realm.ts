import axios from "axios";
import {
  GraphQLPayload,
  RegistryFunction,
  WrappedRegistryFunction,
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

export class RegistryClient {
  static async loginWithAPIKey(): Promise<string> {
    const app = RealmAppSingleton.get();
    const apiKey = process.env.REALM_API_KEY || "";
    const jwtCredentials = Realm.Credentials.serverApiKey(apiKey);
    await app.logIn(jwtCredentials);
    return apiKey;
  }

  static async getFunction(name: string): Promise<RegistryFunction> {
    const realmGraphQLUrl = process.env.REALM_GQL_URL || "";
    const apiKey = await RegistryClient.loginWithAPIKey();

    const res = await axios.post<GraphQLPayload<WrappedRegistryFunction>>(
      realmGraphQLUrl,
      {
        query: `
    {
      function_registry(query: {name:"${name}"}) {
        _id
        name
        raw
        dependencies
        downloads
        tags
      }
    }
    `,
      },
      {
        headers: {
          apiKey,
        },
      }
    );

    const axiosData = res.data;
    const gqlData = axiosData.data;
    return gqlData.function_registry;
  }

  static pushFunctionSource() {}
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
