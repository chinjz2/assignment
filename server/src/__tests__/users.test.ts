import supertest from "supertest";
import createServer from "~/utils/server";
import { prisma } from "~/utils/db";
import {
  getUploadLockHandler,
  freeUploadLockHandler,
  createUploadStatusHandler,
} from "~/controller/upload.controller";
import type { User } from "@prisma/client";
import fs from "fs";

const app = createServer();
const dummyUser: User = {
  id: "dummy001",
  login: "dummyB",
  name: "dummy 001",
  salary: 1000,
  createdAt: new Date(),
};
const dummyUser2: User = {
  id: "dummy002",
  login: "dummyA",
  name: "dummy 002",
  salary: 100000,
  createdAt: new Date(),
};
const dummyUser3: User = {
  id: "dummy003",
  login: "dummyC",
  name: "dummy 003",
  salary: 10000,
  createdAt: new Date(),
};
const createDummyData = async (data: User[]) => {
  for (const entry of data) {
    await supertest(app)
      .post(`/users/${entry.id}`)
      .send({ user: { ...entry } })
      .expect(200);
  }
};
describe("user", () => {
  beforeAll(async () => {
    await prisma.$connect();
    await createUploadStatusHandler({
      id: "main",
      uploading: false,
      owner: "",
      updatedAt: new Date(),
    });
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
    describe("given a png file", () => {
      it("should reject file", async () => {
        const { statusCode } = await supertest(app)
          .post(
            "/users/uploadUserFile?name=test-upload_image.png&currentChunkIndex=0&totalChunks=1&id=0"
          )
          .attach("test-upload_image", "./uploads/test-upload_image.png");
        expect(statusCode).toBe(400);
      });
    });
    describe("given a two concurrent uploads", () => {
      it("only one should pass, the other should fail", async () => {
        await getUploadLockHandler("hold lock");
        const buffer = Buffer.from(
          "data:application/octet-stream;base64," +
            fs.readFileSync("./uploads/test-characters.csv", "base64")
        );
        {
          const { statusCode } = await supertest(app)
            .post(
              "/users/uploadUserFile?name=test-characters.csv&currentChunkIndex=0&totalChunks=1&id=0"
            )
            .set("Content-Type", "multipart/form-data")
            .send(buffer);
          expect(statusCode).toBe(403);
        }
        await freeUploadLockHandler();
        const { body, statusCode } = await supertest(app)
          .post(
            "/users/uploadUserFile?name=test-characters.csv&currentChunkIndex=0&totalChunks=1&id=0"
          )
          .set("Content-Type", "multipart/form-data")
          .send(buffer);
        expect(statusCode).toBe(200);
        fs.unlinkSync("./uploads/" + body.name);
      }, 10000);
    });
  });
  describe("fetch route", () => {
    beforeEach(async () => {
      await prisma.$queryRaw`DELETE FROM User`;
    });
    describe("given minimum salary 5000 and maximum 500000.100 query in url", () => {
      it("should fetch all entries within salary range", async () => {
        const createMultiple: User[] = [dummyUser, dummyUser2, dummyUser3];
        await createDummyData(createMultiple);
        const expectedRes: User[] = [dummyUser2, dummyUser3];
        const { body, statusCode } = await supertest(app).get(
          "/users?minSalary=5000&maxSalary=500000.100&offset=0&limit=30&sort=%2Bid"
        );
        expect(statusCode).toBe(200);
        expect(body.count).toEqual(2);
        body.data.forEach((element: User, idx: number) => {
          expect(element.id).toBe(expectedRes[idx].id);
          expect(element.login).toBe(expectedRes[idx].login);
          expect(element.name).toBe(expectedRes[idx].name);
          expect(element.salary).toBe(expectedRes[idx].salary);
        });
      });
    });
    describe("given invalid range, minimum salary 500000 and maximum 1 query in url", () => {
      it("should fetch all entries instead", async () => {
        const createMultiple: User[] = [dummyUser, dummyUser2, dummyUser3];
        await createDummyData(createMultiple);
        const { body, statusCode } = await supertest(app).get(
          "/users?minSalary=500000&maxSalary=1&offset=0&limit=30&sort=%2Bid"
        );
        expect(statusCode).toBe(200);
        expect(body.count).toEqual(3);
        body.data.forEach((element: User, idx: number) => {
          expect(element.id).toBe(createMultiple[idx].id);
          expect(element.login).toBe(createMultiple[idx].login);
          expect(element.name).toBe(createMultiple[idx].name);
          expect(element.salary).toBe(createMultiple[idx].salary);
        });
      });
    });
    describe("given invalid characters as salary values in url", () => {
      it("should return 400 instead", async () => {
        const { statusCode } = await supertest(app).get(
          "/users?minSalary=abhjf&maxSalary=fosaj&offset=0&limit=30&sort=%2Bid"
        );
        expect(statusCode).toBe(400);
      });
    });
    describe("given negative as salary values in url", () => {
      it("should return 400 instead", async () => {
        const { statusCode } = await supertest(app).get(
          "/users?minSalary=-1283&maxSalary=-749821&offset=0&limit=30&sort=%2Bid"
        );
        expect(statusCode).toBe(400);
      });
    });
    describe("given limit of 1 and offset of 1 query in url", () => {
      it("should fetch only dummy2", async () => {
        const createMultiple: User[] = [dummyUser, dummyUser2, dummyUser3];
        await createDummyData(createMultiple);
        const expectedRes: User[] = [dummyUser2];
        const { body, statusCode } = await supertest(app).get(
          "/users?minSalary=1&maxSalary=9999999&offset=1&limit=1&sort=%2Bid"
        );
        expect(statusCode).toBe(200);
        //total 3 items, but recieve one
        expect(body.count).toEqual(3);
        body.data.forEach((element: User, idx: number) => {
          expect(element.id).toBe(expectedRes[idx].id);
          expect(element.login).toBe(expectedRes[idx].login);
          expect(element.name).toBe(expectedRes[idx].name);
          expect(element.salary).toBe(expectedRes[idx].salary);
        });
      });
    });
    describe("given invalid sort column in url", () => {
      it("should return 400", async () => {
        const { body, statusCode } = await supertest(app).get(
          "/users?minSalary=1&maxSalary=9999999&offset=0&limit=30&sort=%2Bwrong"
        );
        expect(statusCode).toBe(400);
      });
    });
    describe("given sort +id query in url", () => {
      //dummy001,dummy002,dummy003
      it("should fetch all entries in ascending order of id", async () => {
        const createMultiple: User[] = [dummyUser, dummyUser2, dummyUser3];
        await createDummyData(createMultiple);
        const expectedRes: User[] = [dummyUser, dummyUser2, dummyUser3];
        const { body, statusCode } = await supertest(app).get(
          "/users?minSalary=1&maxSalary=9999999&offset=0&limit=30&sort=%2Bid"
        );
        expect(statusCode).toBe(200);
        expect(body.count).toEqual(3);
        body.data.forEach((element: User, idx: number) => {
          expect(element.id).toBe(expectedRes[idx].id);
          expect(element.login).toBe(expectedRes[idx].login);
          expect(element.name).toBe(expectedRes[idx].name);
          expect(element.salary).toBe(expectedRes[idx].salary);
        });
      });
    });
    describe("given sort -id query in url", () => {
      ////dummy003,dummy002,dummy001
      it("should fetch all entries in descending order of id", async () => {
        const createMultiple: User[] = [dummyUser, dummyUser2, dummyUser3];
        await createDummyData(createMultiple);
        const expectedRes: User[] = [dummyUser3, dummyUser2, dummyUser];
        const { body, statusCode } = await supertest(app).get(
          "/users?minSalary=1&maxSalary=9999999&offset=0&limit=30&sort=-id"
        );
        expect(statusCode).toBe(200);
        expect(body.count).toEqual(3);
        body.data.forEach((element: User, idx: number) => {
          expect(element.id).toBe(expectedRes[idx].id);
          expect(element.login).toBe(expectedRes[idx].login);
          expect(element.name).toBe(expectedRes[idx].name);
          expect(element.salary).toBe(expectedRes[idx].salary);
        });
      });
    });
    describe("given sort +login query in url", () => {
      //dummy002: dummyA, dummy001: dummyB,dummy003: dummyC
      it("should fetch all entries in ascending order of login", async () => {
        const createMultiple: User[] = [dummyUser, dummyUser2, dummyUser3];
        await createDummyData(createMultiple);
        const expectedRes: User[] = [dummyUser2, dummyUser, dummyUser3];
        const { body, statusCode } = await supertest(app).get(
          "/users?minSalary=1&maxSalary=9999999&offset=0&limit=30&sort=%2Blogin"
        );
        expect(statusCode).toBe(200);
        expect(body.count).toEqual(3);
        body.data.forEach((element: User, idx: number) => {
          expect(element.id).toBe(expectedRes[idx].id);
          expect(element.login).toBe(expectedRes[idx].login);
          expect(element.name).toBe(expectedRes[idx].name);
          expect(element.salary).toBe(expectedRes[idx].salary);
        });
      });
    });
    describe("given sort -login query in url", () => {
      //dummy003: dummyC, dummy001: dummyB, dummy002: dummyA
      it("should fetch all entries in descending order of login", async () => {
        const createMultiple: User[] = [dummyUser, dummyUser2, dummyUser3];
        await createDummyData(createMultiple);
        const expectedRes: User[] = [dummyUser3, dummyUser, dummyUser2];
        const { body, statusCode } = await supertest(app).get(
          "/users?minSalary=1&maxSalary=9999999&offset=0&limit=30&sort=-login"
        );
        expect(statusCode).toBe(200);
        expect(body.count).toEqual(3);
        body.data.forEach((element: User, idx: number) => {
          expect(element.id).toBe(expectedRes[idx].id);
          expect(element.login).toBe(expectedRes[idx].login);
          expect(element.name).toBe(expectedRes[idx].name);
          expect(element.salary).toBe(expectedRes[idx].salary);
        });
      });
    });
    describe("given sort +name query in url", () => {
      //dummy001: dummy 001,dummy002: dummy002,dummy003: dummy003
      it("should fetch all entries in ascending order of name", async () => {
        const createMultiple: User[] = [dummyUser, dummyUser2, dummyUser3];
        await createDummyData(createMultiple);
        const expectedRes: User[] = [dummyUser, dummyUser2, dummyUser3];
        const { body, statusCode } = await supertest(app).get(
          "/users?minSalary=1&maxSalary=9999999&offset=0&limit=30&sort=%2Bname"
        );
        expect(statusCode).toBe(200);
        expect(body.count).toEqual(3);
        body.data.forEach((element: User, idx: number) => {
          expect(element.id).toBe(expectedRes[idx].id);
          expect(element.login).toBe(expectedRes[idx].login);
          expect(element.name).toBe(expectedRes[idx].name);
          expect(element.salary).toBe(expectedRes[idx].salary);
        });
      });
    });
    describe("given sort -name query in url", () => {
      //dummy003: dummy 003,dummy 002: dummy002,dummy001: dummy 001
      it("should fetch all entries in descending order of name", async () => {
        const createMultiple: User[] = [dummyUser, dummyUser2, dummyUser3];
        await createDummyData(createMultiple);
        const expectedRes: User[] = [dummyUser3, dummyUser2, dummyUser];
        const { body, statusCode } = await supertest(app).get(
          "/users?minSalary=1&maxSalary=9999999&offset=0&limit=30&sort=-name"
        );
        expect(statusCode).toBe(200);
        expect(body.count).toEqual(3);
        body.data.forEach((element: User, idx: number) => {
          expect(element.id).toBe(expectedRes[idx].id);
          expect(element.login).toBe(expectedRes[idx].login);
          expect(element.name).toBe(expectedRes[idx].name);
          expect(element.salary).toBe(expectedRes[idx].salary);
        });
      });
    });
    describe("given sort +salary query in url", () => {
      //dummy001:1000, dummy003:10000, dummy002:100000
      it("should fetch all entries in ascending order of salary", async () => {
        const createMultiple: User[] = [dummyUser, dummyUser2, dummyUser3];
        await createDummyData(createMultiple);
        const expectedRes: User[] = [dummyUser, dummyUser3, dummyUser2];
        const { body, statusCode } = await supertest(app).get(
          "/users?minSalary=1&maxSalary=9999999&offset=0&limit=30&sort=%2Bsalary"
        );
        expect(statusCode).toBe(200);
        expect(body.count).toEqual(3);
        body.data.forEach((element: User, idx: number) => {
          expect(element.id).toBe(expectedRes[idx].id);
          expect(element.login).toBe(expectedRes[idx].login);
          expect(element.name).toBe(expectedRes[idx].name);
          expect(element.salary).toBe(expectedRes[idx].salary);
        });
      });
    });
    describe("given sort -salary query in url", () => {
      //dummy002:100000, dummy003:10000, dummy001:1000
      it("should fetch all entries in descending order of salary", async () => {
        const createMultiple: User[] = [dummyUser, dummyUser2, dummyUser3];
        await createDummyData(createMultiple);
        const expectedRes: User[] = [dummyUser2, dummyUser3, dummyUser];
        const { body, statusCode } = await supertest(app).get(
          "/users?minSalary=1&maxSalary=9999999&offset=0&limit=30&sort=-salary"
        );
        expect(statusCode).toBe(200);
        expect(body.count).toEqual(3);
        body.data.forEach((element: User, idx: number) => {
          expect(element.id).toBe(expectedRes[idx].id);
          expect(element.login).toBe(expectedRes[idx].login);
          expect(element.name).toBe(expectedRes[idx].name);
          expect(element.salary).toBe(expectedRes[idx].salary);
        });
      });
    });
  });
});
