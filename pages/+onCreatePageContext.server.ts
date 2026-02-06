import type { Request, Response } from "express";
import type { PageContextServer } from "vike/types";
import { verifyToken } from '../server/jwt';
export async function onCreatePageContext(pageContext: PageContextServer) {
    const req = pageContext.runtime.req as Request;
    try {
        if (!req || !req.cookies) return;
        const authToken = req.cookies.auth_token;
        if (!authToken) return;
        const user = await verifyToken(authToken);
        if (!user) return;
        const { userId, email, pseudo } = user;
        pageContext.userId = userId.toString();
        pageContext.email = email;
        pageContext.pseudo = pseudo;
        pageContext.isAuthenticated = Boolean(userId);
        console.log("User authenticated", user);
        console.log("Page context", pageContext);
    } catch (error) {
        const res = pageContext.runtime.res as Response;
        res.clearCookie("auth-token");
        console.error(error);
    }
}