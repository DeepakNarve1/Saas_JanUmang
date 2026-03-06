const request = require("supertest");
const app = require("../src/app");

describe("API Health Check", () => {
  it("should return 200/healthy for the base api status", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("healthy");
  });

  it("should return 200 for the root route", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toContain("Api is running...");
  });
});
