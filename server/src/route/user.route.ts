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
/**
 * @openapi
 * '/users?minSalary=1&maxSalary=9999999&offset=0&limit=30&sort=-name':
 *  get:
 *     tags:
 *     - User
 *     summary: Get all users
 *     parameters:
 *      - in: query
 *        name: minSalary
 *        schema:
 *          type: integer
 *        description: lower bound of salary to search
 *      - in: query
 *        name: maxSalary
 *        schema:
 *          type: integer
 *        description: upper bound of salary to search
 *      - in: query
 *        name: offset
 *        schema:
 *          type: integer
 *        description: the number of items to skip
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *        description: the number of items to return
 *      - in: query
 *        name: sort
 *        schema:
 *          type: string
 *        description: + for asc, - for desc, followed by column name to sort
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *          application/json:
 *           schema:
 *              $ref: '#/components/schema/Users'
 *       400:
 *         description: Bad Request
 */
routes.route("/").get(validate(getAllUsersSchema), getAllUsersHandler);
routes
  .route("/:id")
  .get(getOneUserHandler)
  .post(createUserHandler)
  .delete(deleteUserHandler);

export default routes;
