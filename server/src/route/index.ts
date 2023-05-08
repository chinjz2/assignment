import router, { Router } from "express";
import userRoute from "./user.route";

const routes: Router = router();

routes.use("/users", userRoute);

export default routes;
