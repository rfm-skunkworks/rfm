import axios, { AxiosResponse } from "axios";
import realm, { App } from "realm";
import jwt from "jsonwebtoken";
import Realm from "realm";

export default class RegistryClient {
  static async loginWithJWT(app: App): Promise<string> {
    const realmClientAppId = process.env.REALM_CLIENT_APP_ID || "";
    const signingKey = process.env.JWT_SIGNING_KEY || "";

    console.log("signing key:", signingKey);

    // generate jwt token
    const unixTime = Math.floor(Date.now() / 1000);
    const payload = {
      sub: realmClientAppId,
      iat: unixTime,
      aud: realmClientAppId,
    };
    const token = jwt.sign(payload, signingKey, {
      algorithm: "HS256",
      expiresIn: "7d",
    });

    const jwtCredentials = realm.Credentials.jwt(token);
    await app.logIn(jwtCredentials);

    console.log("token:", token);
    return token;
  }

  static async loginWithEmail(
    app: App,
    email: string,
    password: string
  ): Promise<boolean> {
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

  static async registerWithEmail(
    app: App,
    email: string,
    password: string
  ): Promise<boolean> {
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

  static async logout(app: App): Promise<boolean> {
    let user = app.currentUser;
    if (user === null) {
      return false;
    }
    await user.logOut();
    return !user.isLoggedIn;
  }

  static async getFunctionSource(app: App): Promise<AxiosResponse | undefined> {
    const realmGraphQLUrl = process.env.REALM_GQL_URL || "";
    const jwtToken = await RegistryClient.loginWithJWT(app);

    return await axios.post(
      realmGraphQLUrl,
      {
        query: `
    {
      function_registries(query: {name:"foo"}) {
        _id
        name
        owner_id
        raw
      }
    }
    `,
      },
      {
        headers: {
          jwtTokenString: jwtToken,
        },
      }
    );
  }

  static pushFunctionSource() {}
}
