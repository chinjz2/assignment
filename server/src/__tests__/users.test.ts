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
  beforeEach(async () => {
    await prisma.$queryRaw`DELETE FROM User`;
  });
  afterAll(async () => {
    await prisma.$disconnect();
  });
  describe("upload route", () => {
    describe("given entry exist in data base", () => {
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
              fileName: "test-update_if_exists.csv",
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
  });
});
