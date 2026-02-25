const asyncHandler = require("express-async-handler");
const Project = require("../models/projectModel");
const District = require("../models/districtModel");
const { logActivity } = require("./activityLogController");
const { getCreateTenantId } = require("../utils/authHelpers");

// @desc    Get all projects
// @route   GET /api/projects
exports.getProjects = asyncHandler(async (req, res) => {
  const { block, department, status, search, page = 1, limit } = req.query;

  const query = { ...req.scopeFilter };

  if (block) query.block = block;
  if (department) query.department = department;
  if (status) query.status = status;

  if (search) {
    query.$or = [
      { workName: { $regex: search, $options: "i" } },
      { district: { $regex: search, $options: "i" } },
      { officerName: { $regex: search, $options: "i" } },
    ];
  }

  const pageNum = parseInt(page) || 1;
  // Parse limit: if not provided or invalid, default to 10
  // If explicitly -1, keep it as -1 for "all" entries
  let limitNum = 10;
  if (limit !== undefined && limit !== null && limit !== "") {
    const parsedLimit = parseInt(limit);
    if (!isNaN(parsedLimit)) {
      limitNum = parsedLimit;
    }
  }

  let projects;
  let filteredCount;
  let totalCount = await Project.countDocuments({ ...req.scopeFilter });

  // If limit is -1, fetch all records
  if (limitNum === -1) {
    projects = await Project.find(query).sort({ createdAt: -1 });
    filteredCount = projects.length;
  } else {
    const skip = (pageNum - 1) * limitNum;
    projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    filteredCount = await Project.countDocuments(query);
  }

  res.json({
    success: true,
    data: projects,
    count: totalCount,
    filteredCount: filteredCount,
  });
});

// @desc    Get single project
// @route   GET /api/projects/:id
exports.getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  // Optimize: Lookup related IDs
  const related = {
    districtId: null,
    divisionId: null,
    stateId: null,
  };

  if (project.district) {
    const distDoc = await District.findOne({ name: project.district }).populate(
      {
        path: "division",
        populate: { path: "state" },
      },
    );
    if (distDoc) {
      related.districtId = distDoc._id;
      if (distDoc.division) {
        related.divisionId = distDoc.division._id;
        related.divisionName = distDoc.division.name;
        if (distDoc.division.state) {
          related.stateId = distDoc.division.state._id;
          related.stateName = distDoc.division.state.name;
        }
      }
    }
  }

  res.json({ success: true, data: { ...project.toObject(), related } });
});

// @desc    Create a project
// @route   POST /api/projects
exports.createProject = asyncHandler(async (req, res) => {
  const project = await Project.create({
    ...req.body,
    tenantId: getCreateTenantId(req), // SaaS: system admins create orphan records
  });

  await logActivity(
    req,
    "CREATE",
    "Project",
    `Created project: ${project.workName}`,
    { recordId: project._id, newData: project },
  );

  res.status(201).json({ success: true, data: project });
});

// @desc    Update a project
// @route   PUT /api/projects/:id
exports.updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  const oldData = project.toObject();

  const updatedProject = await Project.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true },
  );

  await logActivity(
    req,
    "UPDATE",
    "Project",
    `Updated project: ${updatedProject.workName}`,
    { recordId: updatedProject._id, newData: updatedProject, oldData },
  );

  res.json({ success: true, data: updatedProject });
});

// @desc    Delete a project
// @route   DELETE /api/projects/:id
exports.deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  await project.deleteOne();

  await logActivity(
    req,
    "DELETE",
    "Project",
    `Deleted project: ${project.workName}`,
    { recordId: project._id, oldData: project },
  );

  res.json({ success: true, message: "Project removed" });
});

// @desc    Seed projects
// @route   POST /api/projects/seed
exports.seedProjects = asyncHandler(async (req, res) => {
  await Project.deleteMany();
  const projects = Array.from({ length: 50 }).map((_, i) => ({
    district: i % 2 === 0 ? "Dhar" : "Indore",
    block: i % 3 === 0 ? "Bagh" : "Tanda",
    department: i % 2 === 0 ? "PWD" : "Education",
    workName: `Project Work ${i + 1} - Road Construction`,
    projectCost: (i + 1) * 100000,
    proposalEstimate: (i + 1) * 120000,
    tsNoDate: `TS-${100 + i}/2025`,
    asNoDate: `AS-${500 + i}/2025`,
    status: i % 4 === 0 ? "Completed" : "In Progress",
    officerName: `Officer ${String.fromCharCode(65 + (i % 26))}`,
    contactNumber: "9876543210",
    remarks: "Sample remark for project",
  }));

  await Project.insertMany(projects);
  res.json({ success: true, message: "Seeded 50 projects" });
});
