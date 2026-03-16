const asyncHandler = require("express-async-handler");
const Member = require("../models/memberModel");
const { logActivity } = require("./activityLogController");
const { getCreateTenantId } = require("../utils/authHelpers");

// @desc    Get members
// @route   GET /api/members
// @access  Private
exports.getMembers = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit,
      search,
      district,
      block,
      postYear,
      vehicle,
      samiti,
      code,
    } = req.query;

    const query = { ...req.scopeFilter };

    // Text Search
    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { name: { $regex: escapedSearch, $options: "i" } },
        { voterId: { $regex: escapedSearch, $options: "i" } },
        { mobile: { $regex: escapedSearch, $options: "i" } },
        { fatherName: { $regex: escapedSearch, $options: "i" } },
        { district: { $regex: escapedSearch, $options: "i" } },
        { block: { $regex: escapedSearch, $options: "i" } },
        { samiti: { $regex: escapedSearch, $options: "i" } },
        { code: { $regex: escapedSearch, $options: "i" } },
        { grampanchayat: { $regex: escapedSearch, $options: "i" } },
        { village: { $regex: escapedSearch, $options: "i" } },
        { boothName: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    // Filters
    if (district && district !== "all") query.district = district;
    if (block && block !== "all") query.block = block;
    if (postYear && postYear !== "all") query.postYear = postYear;
    if (vehicle && vehicle !== "all") query.vehicle = vehicle;
    if (samiti && samiti !== "all") query.samiti = samiti;
    if (code && code !== "all") query.code = code;

    const pageNum = parseInt(page) || 1;
    let limitNum = 10;
    if (limit !== undefined && limit !== null && limit !== "") {
      const parsedLimit = parseInt(limit);
      if (!isNaN(parsedLimit)) {
        limitNum = parsedLimit;
      }
    }

    let queryBuilder = Member.find(query)
      .populate("tenantId", "name")
      .sort({ createdAt: -1 })
      .allowDiskUse(true);

    if (limitNum !== -1) {
      const skip = (pageNum - 1) * limitNum;
      queryBuilder = queryBuilder.skip(skip).limit(limitNum);
    }

    const [members, total, count] = await Promise.all([
      queryBuilder,
      Member.countDocuments({ ...req.scopeFilter }),
      Member.countDocuments(query),
    ]);

    const formattedMembers = members.map((m) => {
      const obj = m.toObject();
      if (!obj.startDate) obj.startDate = obj.createdAt;
      if (!obj.endDate) obj.endDate = obj.createdAt;
      return obj;
    });

    res.json({
      success: true,
      data: formattedMembers,
      total,
      count,
      pagination: {
        page: pageNum,
        pages: limitNum === -1 ? 1 : Math.ceil(count / limitNum),
      },
    });
  } catch (error) {
    console.error("Error in getMembers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch members",
      error: error.message,
    });
  }
});

// @desc    Get member by ID
// @route   GET /api/members/:id
// @access  Private
exports.getMemberById = asyncHandler(async (req, res) => {
  const member = await Member.findOne({
    _id: req.params.id,
    ...req.scopeFilter,
  }).populate("tenantId", "name");

  if (!member) {
    res.status(404);
    throw new Error("Member not found");
  }

  res.json({ success: true, data: member });
});

// @desc    Create a member
// @route   POST /api/members
// @access  Private
exports.createMember = asyncHandler(async (req, res) => {
  const memberData = {
    ...req.body,
    addedBy: req.user ? req.user.name : "System",
    startDate: req.body.startDate || new Date(),
    endDate: req.body.endDate || new Date(),
    tenantId: getCreateTenantId(req), // SaaS: system admins create orphan records
  };

  const member = await Member.create(memberData);

  await logActivity(
    req,
    "CREATE",
    "Member",
    `Created member: ${member.name} (${member.code})`,
    { recordId: member._id, newData: member },
  );

  res.status(201).json({ success: true, data: member });
});

// @desc    Update member
// @route   PUT /api/members/:id
// @access  Private
exports.updateMember = asyncHandler(async (req, res) => {
  const member = await Member.findOne({
    _id: req.params.id,
    ...req.scopeFilter,
  });

  if (!member) {
    res.status(404);
    throw new Error("Member not found");
  }

  const oldData = member.toObject();

  // Update fields from body — EXCLUDE security-critical fields
  Object.keys(req.body).forEach((key) => {
    // Prevent hijacking the record to another tenant or spoofing IDs
    if (["tenantId", "_id", "__v"].includes(key)) return;

    if (req.body[key] !== undefined) {
      member[key] = req.body[key];
    }
  });

  const updatedMember = await member.save();

  await logActivity(
    req,
    "UPDATE",
    "Member",
    `Updated member: ${updatedMember.name} (${updatedMember.code})`,
    { recordId: updatedMember._id, newData: updatedMember, oldData },
  );

  res.json({ success: true, data: updatedMember });
});

// @desc    Delete member
// @route   DELETE /api/members/:id
// @access  Private
exports.deleteMember = asyncHandler(async (req, res) => {
  const member = await Member.findOne({
    _id: req.params.id,
    ...req.scopeFilter,
  });

  if (!member) {
    res.status(404);
    throw new Error("Member not found");
  }

  await member.deleteOne();

  await logActivity(req, "DELETE", "Member", `Deleted member: ${member.code}`, {
    recordId: member._id,
    oldData: member,
  });

  res.json({ success: true, message: "Member removed" });
});
