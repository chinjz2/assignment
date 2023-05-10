import router, { Router } from "express";
import bodyParser from "body-parser";
import validate from "middleware/validateResource";
import {
  createUsersHandler,
  getAllUsersHandler,
  getOneUserHandler,
  createUserHandler,
  updateUserHandler,
  deleteUserHandler,
  uploadUsersHandler,
} from "~/controller/user.controller";
import { getAllUsersSchema } from "~/schema/user.schema";

const routes: Router = router();

routes.route("/upload").post(createUsersHandler);
routes
  .route("/uploadUserFile")
  .post(
    bodyParser.raw({ limit: "50mb", type: () => true }),
    uploadUsersHandler
  );
routes.route("/").get(validate(getAllUsersSchema), getAllUsersHandler);
routes
  .route("/:id")
  .get(getOneUserHandler)
  .post(createUserHandler)
  .patch(updateUserHandler)
  .delete(deleteUserHandler);

export default routes;
