const inquirer = require("inquirer");
import Realm = require("realm");

const realmClientAppId = process.env.REALM_CLIENT_APP_ID || "";
const appConfig = {
    id: realmClientAppId,
    timeout: 10000,
};

const app = new Realm.App(appConfig);

export async function logIn(): Promise<boolean> {
    const input = await inquirer.prompt([
        {
            type: "input",
            name: "email",
            message: "Email:",
        },
        {
            type: "password",
            name: "password",
            message: "Password:",
            mask: "*",
        },
    ]);

    try {
        const credentials = Realm.Credentials.emailPassword(
            input.email,
            input.password
        );

        const user = await app.logIn(credentials);
        if (user) {
            console.log("You have successfully logged in");
           return true
        } else {
            console.log("There was an error logging you in");
            return false

        }
    } catch (err) {
        console.log(err)
        return false;
    }
}

export async function register(): Promise<boolean> {
    const input = await inquirer.prompt([
        {
            type: "input",
            name: "email",
            message: "Email:",
        },
        {
            type: "password",
            name: "password",
            message: "Password:",
            mask: "*",
        },
    ]);

    try {
        await app.emailPasswordAuth.registerUser({
            email: input.email,
            password: input.password,
        });
        const credentials = Realm.Credentials.emailPassword(
            input.email,
            input.password
        );
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

export async function logOut(): Promise<boolean>{
    let user = app.currentUser;
    if (user === null) {
        return false
    }
    await user.logOut();
    return !user.isLoggedIn;
}

export function getAuthedUser() {
    return app.currentUser;
}