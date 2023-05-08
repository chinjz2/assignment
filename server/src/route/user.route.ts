import router, { Router } from "express";
import bodyParser from "body-parser";
import {
  createUsersHandler,
  getAllUsersHandler,
  getOneUserHandler,
  createUserHandler,
  updateUserHandler,
  deleteUserHandler,
  uploadUsersHandler,
} from "~/controller/user.controller";

const routes: Router = router();

routes.route("/upload").post(createUsersHandler);
routes
  .route("/uploadUserFile")
  .post(
    bodyParser.raw({ limit: "50mb", type: () => true }),
    uploadUsersHandler
  );
routes.route("/").get(getAllUsersHandler);
routes
  .route("/:id")
  .get(getOneUserHandler)
  .post(createUserHandler)
  .patch(updateUserHandler)
  .delete(deleteUserHandler);

export default routes;
