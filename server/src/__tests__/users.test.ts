import supertest from "supertest";
import createServer from "~/utils/server";
import { prisma } from "~/utils/db";
import type { User } from "@prisma/client";

const app = createServer();
const dummyUser: User = {
  id: "dummy001",
  login: "dummy",
  name: "dummy 001",
  salary: 1000,
  createdAt: new Date(),
};

describe("user", () => {
  beforeAll(async () => {
    await prisma.$connect();
  });
  afterAll(async () => {
    await prisma.$queryRaw`DELETE FROM User`;
    await prisma.$disconnect();
  });
  describe("upload route", () => {
    beforeEach(async () => {
      await prisma.$queryRaw`DELETE FROM User`;
    });
    describe("given entry does not exist in database", () => {
      it("should create entry", async () => {
        //insert entries in the specified file
        //dummy001,diff1,diff2,0
        {
          const { statusCode } = await supertest(app)
            .post("/users/upload")
            .send({
              fileName: "test-update_or_create.csv",
              time: new Date(),
            });
          expect(statusCode).toBe(200);
        }
        //fetch new data and verify
        const { body, statusCode } = await supertest(app).get(
          "/users/dummy001"
        );
        expect(statusCode).toBe(200);
        expect(body.id).toBe(dummyUser.id);
        expect(body.login).toBe("diff1");
        expect(body.name).toBe("diff2");
        expect(body.salary).toBe(0);
      });
    });
    describe("given entry exist in database", () => {
      it("should update entry", async () => {
        //insert dummy
        {
          const { body, statusCode } = await supertest(app)
            .post("/users/dummy001")
            .send({ user: { ...dummyUser } });
          expect(statusCode).toBe(200);
          expect(body.id).toBe(dummyUser.id);
        }
        //update dummy entry with new data
        //dummy001,diff1,diff2,0
        {
          const { statusCode } = await supertest(app)
            .post("/users/upload")
            .send({
              fileName: "test-update_or_create.csv",
              time: new Date(),
            });
          expect(statusCode).toBe(200);
        }
        //fetch new data and verify
        const { body, statusCode } = await supertest(app).get(
          "/users/dummy001"
        );
        expect(statusCode).toBe(200);
        expect(body.id).toBe(dummyUser.id);
        expect(body.login).toBe("diff1");
        expect(body.name).toBe("diff2");
        expect(body.salary).toBe(0);
      });
    });
    describe("given entry begins with #", () => {
      it("should ignore entry and continue", async () => {
        //insert entries in the specified file
        //#dummy001,diff1,diff2,0
        //dummy002,dummy0021,dummy0022,10
        {
          const { statusCode } = await supertest(app)
            .post("/users/upload")
            .send({
              fileName: "test-ignore_comment.csv",
              time: new Date(),
            });
          expect(statusCode).toBe(200);
        }
        //fetch #dummy001 and verify
        {
          const { body, statusCode } = await supertest(app).get(
            "/users/" + encodeURIComponent("#dummy001")
          );
          expect(body).toBe(null);
          expect(statusCode).toBe(200);
        }
        //fetch dummy002 and verify
        const { body, statusCode } = await supertest(app).get(
          "/users/dummy002"
        );
        expect(statusCode).toBe(200);
        expect(body.id).toBe("dummy002");
        expect(body.login).toBe("dummy0021");
        expect(body.name).toBe("dummy0022");
        expect(body.salary).toBe(10);
      });
    });
    describe("given entry has duplicate login", () => {
      it("should roll back on all inserts", async () => {
        //insert file with duplicate login
        //dummy001,diff1,diff2,0
        //dummy002,diff1,dummy0022,10
        {
          const { statusCode } = await supertest(app)
            .post("/users/upload")
            .send({
              fileName: "test-duplicate_login.csv",
              time: new Date(),
            });
          expect(statusCode).toBe(400);
        }
        //fetch new data and verify dummy001 got rolled back
        const { body, statusCode } = await supertest(app).get(
          "/users/dummy001"
        );
        expect(statusCode).toBe(200);
        expect(body).toBe(null);
      });
    });
    describe("given entry has invalid salary", () => {
      it("should roll back on all inserts", async () => {
        //insert file with duplicate login
        //dummy001,diff1,diff2,0
        //dummy002,dummy0021,dummy0022,abc
        {
          const { statusCode } = await supertest(app)
            .post("/users/upload")
            .send({
              fileName: "test-invalid_salary.csv",
              time: new Date(),
            });
          expect(statusCode).toBe(400);
        }
        //fetch new data and verify dummy001 got rolled back
        const { body, statusCode } = await supertest(app).get(
          "/users/dummy001"
        );
        expect(statusCode).toBe(200);
        expect(body).toBe(null);
      });
    });
    describe("given entry has negative salary", () => {
      it("should roll back on all inserts", async () => {
        //insert file with duplicate login
        //dummy001,diff1,diff2,0
        //dummy002,dummy0021,dummy0022,-280
        {
          const { statusCode } = await supertest(app)
            .post("/users/upload")
            .send({
              fileName: "test-negative_salary.csv",
              time: new Date(),
            });
          expect(statusCode).toBe(400);
        }
        //fetch new data and verify dummy001 got rolled back
        const { body, statusCode } = await supertest(app).get(
          "/users/dummy001"
        );
        expect(statusCode).toBe(200);
        expect(body).toBe(null);
      });
    });
    describe("given entry has missing columns", () => {
      it("should roll back on all inserts", async () => {
        //insert file with duplicate login
        //dummy001,diff1,diff2,0
        //dummy002,dummy0021,dummy0022
        {
          const { statusCode } = await supertest(app)
            .post("/users/upload")
            .send({
              fileName: "test-missing_columns.csv",
              time: new Date(),
            });
          expect(statusCode).toBe(400);
        }
        //fetch new data and verify dummy001 got rolled back
        const { body, statusCode } = await supertest(app).get(
          "/users/dummy001"
        );
        expect(statusCode).toBe(200);
        expect(body).toBe(null);
      });
    });
    describe("given entry has extra columns", () => {
      it("should roll back on all inserts", async () => {
        //insert file with duplicate login
        //dummy001,diff1,diff2,0
        //dummy002,dummy0021,dummy0022,280,abc
        {
          const { statusCode } = await supertest(app)
            .post("/users/upload")
            .send({
              fileName: "test-additional_columns.csv",
              time: new Date(),
            });
          expect(statusCode).toBe(400);
        }
        //fetch new data and verify dummy001 got rolled back
        const { body, statusCode } = await supertest(app).get(
          "/users/dummy001"
        );
        expect(statusCode).toBe(200);
        expect(body).toBe(null);
      });
    });
  });
});
