const asyncHandler = require("express-async-handler");
const State = require("../models/stateModel");
const { logActivity } = require("./activityLogController");

// @desc    Get all states
// @route   GET /api/states
exports.getStates = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;

  const query = {};

  if (search) {
    query.$or = [{ name: { $regex: search, $options: "i" } }];
  }

  const pageNum = Number(page);
  const limitNum = Number(limit);

  let states;
  let filteredCount;
  let totalCount = await State.countDocuments({});

  if (limitNum === -1) {
    states = await State.find(query).sort({ name: 1 });
    filteredCount = states.length;
  } else {
    const skip = (pageNum - 1) * limitNum;
    states = await State.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limitNum);
    filteredCount = await State.countDocuments(query);
  }

  res.json({
    success: true,
    data: states,
    count: totalCount,
    filteredCount: filteredCount,
  });
});

// @desc    Get single state
// @route   GET /api/states/:id
exports.getStateById = asyncHandler(async (req, res) => {
  const state = await State.findById(req.params.id);
  if (!state) {
    res.status(404);
    throw new Error("State not found");
  }
  const Division = require("../models/divisionModel");
  const divisions = await Division.find({ state: state._id });

  res.json({ success: true, data: { ...state.toObject(), divisions } });
});

// @desc    Create a state
// @route   POST /api/states
exports.createState = asyncHandler(async (req, res) => {
  const { name, divisions } = req.body;
  const state = await State.create({ name });

  if (divisions && Array.isArray(divisions) && divisions.length > 0) {
    const Division = require("../models/divisionModel");
    const divisionsToInsert = divisions
      .filter((d) => d && d.trim() !== "")
      .map((d) => ({
        name: d,
        state: state._id,
      }));
    if (divisionsToInsert.length > 0) {
      await Division.insertMany(divisionsToInsert);
    }
  }

  await logActivity(req, "CREATE", "State", `Created state: ${state.name}`, {
    recordId: state._id,
    newData: state,
  });

  res.status(201).json({ success: true, data: state });
});

// @desc    Update a state
// @route   PUT /api/states/:id
exports.updateState = asyncHandler(async (req, res) => {
  const state = await State.findById(req.params.id);
  if (!state) {
    res.status(404);
    throw new Error("State not found");
  }
  const updatedState = await State.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  const { divisions } = req.body;
  if (divisions && Array.isArray(divisions) && divisions.length > 0) {
    const Division = require("../models/divisionModel");
    const divisionsToInsert = divisions
      .filter((d) => d && d.trim() !== "")
      .map((d) => ({
        name: d,
        state: updatedState._id,
      }));

    if (divisionsToInsert.length > 0) {
      await Division.insertMany(divisionsToInsert);
    }
  }

  await logActivity(
    req,
    "UPDATE",
    "State",
    `Updated state: ${updatedState.name}`,
    { recordId: updatedState._id, newData: updatedState, oldData: state },
  );

  res.json({ success: true, data: updatedState });
});

// @desc    Delete a state
// @route   DELETE /api/states/:id
exports.deleteState = asyncHandler(async (req, res) => {
  const state = await State.findById(req.params.id);
  if (!state) {
    res.status(404);
    throw new Error("State not found");
  }
  await state.deleteOne();

  await logActivity(req, "DELETE", "State", `Deleted state: ${state.name}`, {
    recordId: state._id,
    oldData: state,
  });

  res.json({ success: true, message: "State removed" });
});
