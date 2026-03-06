const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/userModel");
const Role = require("../src/models/roleModel");
const Tenant = require("../src/models/tenantModel");
const jwt = require("jsonwebtoken");

describe("Auth Controller", () => {
  let roleId;
  let tenantId;
  let adminToken;

  beforeEach(async () => {
    // 1. Create a Tenant
    const tenant = await Tenant.create({
      name: "Test Org",
      slug: "test-org-" + Date.now(), // Unique slug
    });
    tenantId = tenant._id;

    // 2. Create a Role for that tenant
    const role = await Role.create({
      name: "regularUser",
      displayName: "Regular User",
      permissions: [],
      tenantId: tenantId,
    });
    roleId = role._id;

    // 3. Create an Admin User to test protected /register
    const adminRole = await Role.create({
      name: "tenantAdmin",
      displayName: "Tenant Admin",
      level: "tenant_admin",
      tenantId: tenantId,
    });

    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: "password123",
      role: adminRole._id,
      tenantId: tenantId,
      level: "tenant_admin",
    });

    adminToken = jwt.sign(
      { id: adminUser._id },
      process.env.JWT_SECRET || "test_secret",
      {
        expiresIn: "1h",
      },
    );
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully (when authorized as admin)", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "New User",
          email: "new@example.com",
          password: "password123",
          role: roleId.toString(),
        });

      if (res.status !== 201) {
        console.error("Register failed:", res.body);
      }

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe("new@example.com");
      expect(res.body.data.tenantId.toString()).toBe(tenantId.toString());
    });

    it("should return 400 for duplicate email", async () => {
      await User.create({
        name: "Existing user",
        email: "test@example.com",
        password: "password123",
        role: roleId,
        tenantId: tenantId,
      });

      const res = await request(app)
        .post("/api/auth/register")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Existing user",
          email: "test@example.com",
          password: "password123",
          role: roleId.toString(),
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("User already exists");
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await User.create({
        name: "Login User",
        email: "login@example.com",
        password: "password123",
        role: roleId,
        tenantId: tenantId,
      });
    });

    it("should login successfully with correct credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "login@example.com",
        password: "password123",
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it("should return 401 for wrong credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "login@example.com",
        password: "wrong_password",
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain("Wrong email or password");
    });
  });
});
