const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/userModel");
const Role = require("../src/models/roleModel");
const Tenant = require("../src/models/tenantModel");
const Voter = require("../src/models/voterModel");
const Permission = require("../src/models/permissionModel");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

describe("SaaS Tenant Isolation", () => {
  let tenantA, tenantB;
  let userA, userB;
  let tokenA, tokenB;
  let viewVotersPermission;

  beforeEach(async () => {
    // 1. Setup Permissions
    viewVotersPermission = await Permission.create({
      name: "view_voters",
      displayName: "View Voters",
      module: "voters"
    });

    // 2. Setup Tenant A
    tenantA = await Tenant.create({
      name: "Tenant Alpha",
      slug: "tenant-alpha-" + Date.now(),
      plan: "pro",
      enabledModules: ["voters"]
    });

    const roleA = await Role.create({
      name: "admin",
      permissions: [viewVotersPermission._id],
      tenantId: tenantA._id
    });

    userA = await User.create({
      name: "User Alpha",
      email: "alpha@example.com",
      password: "password123",
      role: roleA._id,
      tenantId: tenantA._id,
      level: "tenant_admin"
    });

    tokenA = jwt.sign({ id: userA._id }, process.env.JWT_SECRET || "test_secret");

    // 3. Setup Tenant B
    tenantB = await Tenant.create({
      name: "Tenant Beta",
      slug: "tenant-beta-" + Date.now(),
      plan: "pro",
      enabledModules: ["voters"]
    });

    const roleB = await Role.create({
      name: "admin",
      permissions: [viewVotersPermission._id],
      tenantId: tenantB._id
    });

    userB = await User.create({
      name: "User Beta",
      email: "beta@example.com",
      password: "password123",
      role: roleB._id,
      tenantId: tenantB._id,
      level: "tenant_admin"
    });

    tokenB = jwt.sign({ id: userB._id }, process.env.JWT_SECRET || "test_secret");
  });

  it("should ensure Tenant A cannot see Tenant B's voters", async () => {
    // Dummy ObjectIds for required fields
    const dummyIds = {
      state: new mongoose.Types.ObjectId(),
      division: new mongoose.Types.ObjectId(),
      district: new mongoose.Types.ObjectId(),
      parliament: new mongoose.Types.ObjectId(),
      assembly: new mongoose.Types.ObjectId(),
      block: new mongoose.Types.ObjectId(),
      panchayat: new mongoose.Types.ObjectId(),
      booth: new mongoose.Types.ObjectId(),
      fatherName: "Father",
      mobileNumber: "1234567890",
      age: 30,
      fulladdress: "Address",
      village: "Village"
    };

    // Create a voter for Tenant B
    await Voter.create({
      name: "John Beta",
      voterId: "VBT123",
      tenantId: tenantB._id,
      isActive: true,
      ...dummyIds
    });

    // Create a voter for Tenant A
    await Voter.create({
      name: "Alice Alpha",
      voterId: "VAL456",
      tenantId: tenantA._id,
      isActive: true,
      ...dummyIds
    });

    // Query as User A
    const resA = await request(app)
      .get("/api/voters")
      .set("Authorization", `Bearer ${tokenA}`);

    expect(resA.status).toBe(200);
    expect(resA.body.data.length).toBe(1);
    expect(resA.body.data[0].name).toBe("Alice Alpha");
    expect(resA.body.data[0].voterId).toBe("VAL456");

    // Query as User B
    const resB = await request(app)
      .get("/api/voters")
      .set("Authorization", `Bearer ${tokenB}`);

    expect(resB.status).toBe(200);
    expect(resB.body.data.length).toBe(1);
    expect(resB.body.data[0].name).toBe("John Beta");
    expect(resB.body.data[0].voterId).toBe("VBT123");
  });

  it("should block direct ID access to another tenant's voter", async () => {
    const dummyIds = {
      state: new mongoose.Types.ObjectId(),
      division: new mongoose.Types.ObjectId(),
      district: new mongoose.Types.ObjectId(),
      parliament: new mongoose.Types.ObjectId(),
      assembly: new mongoose.Types.ObjectId(),
      block: new mongoose.Types.ObjectId(),
      panchayat: new mongoose.Types.ObjectId(),
      booth: new mongoose.Types.ObjectId(),
      fatherName: "Father",
      mobileNumber: "1234567891",
      age: 30,
      fulladdress: "Address",
      village: "Village"
    };

    // Voter belonging to Tenant B
    const voterB = await Voter.create({
      name: "Private Voter",
      voterId: "PVT000",
      tenantId: tenantB._id,
      isActive: true,
      ...dummyIds
    });

    // User A tries to access Voter B by ID
    const res = await request(app)
      .get(`/api/voters/${voterB._id}`)
      .set("Authorization", `Bearer ${tokenA}`);

    // Should be 404 because the query is scoped to userA's tenant
    expect(res.status).toBe(404);
  });
});
