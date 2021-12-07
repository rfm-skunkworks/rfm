const prompt = require("prompt");
import { RealmApp } from "../index";
import RegistryClient from "./realm";

const registerOrLoginSchema = {
  properties: {
    registerOrLogin: {
      pattern: /\b(register)\b|\b(login)\b/,
      message: "choose to either 'register' or 'login'",
      required: true,
    },
  },
};

const emailAndPasswordSchema = {
  properties: {
    email: {
      pattern:
        /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/,
      message: "must be a valid email",
      required: true,
    },
    password: {
      pattern: /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z]).{8,}$/,
      message:
        "must be >= 8 characters, contain a capital letter, lowercase letter, and number",
      required: true,
      hidden: true,
    },
  },
};

export async function loginOrRegisterUserWithEmail() {
  const client = new RegistryClient();
  prompt.start();

  const registerOrLogin = await prompt.get(registerOrLoginSchema);
  if (registerOrLogin === "register") {
    let registered = false;
    do {
      const emailAndPassword = await prompt.get(emailAndPasswordSchema);
      registered = await RegistryClient.registerWithEmail(
        RealmApp,
        emailAndPassword.email,
        emailAndPassword.password
      );
    } while (!registered);
  } else {
    let loggedIn = false;
    do {
      const emailAndPassword = await prompt.get(emailAndPasswordSchema);
      loggedIn = await RegistryClient.loginWithEmail(
        RealmApp,
        emailAndPassword.email,
        emailAndPassword.password
      );
    } while (!loggedIn);
  }
}
