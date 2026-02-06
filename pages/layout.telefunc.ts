import { removeAuthTokenCookie } from "../server/auth-utils";

export default async function onLogout() {
    try {
        removeAuthTokenCookie();
        return { success: true };
    } catch (error) {
        console.error("Error during logout", error);
        return { success: false, error: "Error during logout" };
    }
}
