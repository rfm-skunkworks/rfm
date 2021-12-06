import axios, { AxiosResponse } from "axios";
import realm, { App } from "realm";
import jwt from "jsonwebtoken";

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
