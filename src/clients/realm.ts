import axios, { AxiosResponse } from "axios";
import realm, { App } from "realm-web";
import jwt from 'jsonwebtoken'

const realmClientAppId = process.env.REALM_CLIENT_APP_ID || "";
const realmGraphQLUrl = process.env.REALM_GQL_URL || "";
export default class RegistryClient {
  app?: App;
  user?: App;

  loginWithJWT() {
    // generate jwt token
    const unixTime = Math.floor(Date.now() / 1000);
    const payload = {
      sub: realmClientAppId,
      iat: unixTime,
      exp: 
    };
    const token = jwt.sign(payload, "", {expiresIn: "7d"})


    const app = new realm.App(realmClientAppId);
    const jwtCredentials = realm.Credentials.jwt();
    app.logIn(jwtCredentials);
  }

  static getFunctionSource(): Promise<AxiosResponse> {
    const res = axios.post(realmGraphQLUrl, {
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
    });
    return res;
  }

  static pushFunctionSource() {}
}
