import router, { Router } from "express";
import bodyParser from "body-parser";
import validate from "~/middleware/validateResource";
import {
  uploadUsersFromFileHandler,
  getAllUsersHandler,
  getOneUserHandler,
  createUserHandler,
  deleteUserHandler,
  uploadUserFileHandler,
} from "~/controller/user.controller";
import {
  getAllUsersSchema,
  uploadUsersFromFileSchema,
  uploadUserFileSchema,
} from "~/schema/user.schema";

const routes: Router = router();

routes
  .route("/upload")
  .post(validate(uploadUsersFromFileSchema), uploadUsersFromFileHandler);
routes
  .route("/uploadUserFile")
  .post(
    [
      bodyParser.raw({ limit: "50mb", type: () => true }),
      validate(uploadUserFileSchema),
    ],
    uploadUserFileHandler
  );
routes.route("/").get(validate(getAllUsersSchema), getAllUsersHandler);
routes
  .route("/:id")
  .get(getOneUserHandler)
  .post(createUserHandler)
  .delete(deleteUserHandler);

export default routes;
