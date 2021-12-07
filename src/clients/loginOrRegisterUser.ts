const prompt = require("prompt");
import { RealmApp } from "../index";
import { loginWithEmail, registerWithEmail } from "./realm";

const registerOrLoginSchema = {
  properties: {
    registerOrLogin: {
      description: "choose to either 'register' or 'login'",
      pattern: /\b(register)\b|\b(login)\b/,
      message: "valid options are 'register' and 'login'",
      required: true,
    },
  },
};

const emailAndPasswordSchema = {
  properties: {
    email: {
      description: "enter username",
      pattern:
        /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/,
      message: "must be a valid email",
      required: true,
    },
    password: {
      description: "enter password",
      replace: "*",
      pattern: /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z]).{8,}$/,
      message:
        "must be >= 8 characters, contain a capital letter, lowercase letter, and number",
      required: true,
      hidden: true,
    },
  },
};

export async function loginOrRegisterUserWithEmail() {
  prompt.start();

  const registerOrLogin = await prompt.get(registerOrLoginSchema);
  if (registerOrLogin === "register") {
    let registered = false;
    do {
      const emailAndPassword = await prompt.get(emailAndPasswordSchema);
      registered = await registerWithEmail(
        RealmApp,
        emailAndPassword.email,
        emailAndPassword.password
      );
    } while (!registered);
  } else {
    let loggedIn = false;
    do {
      const emailAndPassword = await prompt.get(emailAndPasswordSchema);
      loggedIn = await loginWithEmail(
        RealmApp,
        emailAndPassword.email,
        emailAndPassword.password
      );
    } while (!loggedIn);
  }
}
