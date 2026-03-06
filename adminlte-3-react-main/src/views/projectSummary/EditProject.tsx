"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFormik } from "formik";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { handleError } from "@app/utils/errorHandler";
import { projectSchema, projectInitialValues } from "./project.schema";

import { Input } from "@app/components/ui/input";
import { Textarea } from "@app/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";
import { Button } from "@app/components/ui/button";
import { Label } from "@app/components/ui/label";
import { ContentHeader } from "@app/components";
import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";

const EditProject = () => {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.MANAGE_ROLES, PERMISSIONS.EDIT_PROJECTS]}>
      <EditProjectContent />
    </RouteGuard>
  );
};

const EditProjectContent = () => {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [statesList, setStatesList] = useState([]);
  const [divisionsList, setDivisionsList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("");
  const [blocksList, setBlocksList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);

  const formik = useFormik({
    initialValues: projectInitialValues,
    validationSchema: projectSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const payload = {
          ...values,
          projectCost: Number(values.projectCost) || 0,
          proposalEstimate: Number(values.proposalEstimate) || 0,
        };
        await axios.put(`/projects/${id}`, payload);
        toast.success("Project updated successfully!");
        router.push("/project-summary");
      } catch (error: unknown) {
        handleError(error, "Failed to update project");
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    fetchStates();
    fetchBlocks();
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (selectedState) {
      fetchDivisions(selectedState);
    } else {
      setDivisionsList([]);
      setDistrictsList([]);
      setSelectedDivision("");
    }
  }, [selectedState]);

  useEffect(() => {
    if (selectedDivision) {
      fetchDistricts(selectedDivision);
    } else {
      setDistrictsList([]);
    }
  }, [selectedDivision]);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      try {
        setFetching(true);
        const res = await axios.get(`/projects/${id}`);
        const data = res.data?.data;
        if (data) {
          formik.setValues({
            district: data.district || "",
            block: data.block || "",
            department: data.department || "",
            workName: data.workName || "",
            projectCost: data.projectCost?.toString() || "",
            proposalEstimate: data.proposalEstimate?.toString() || "",
            tsNoDate: data.tsNoDate || "",
            asNoDate: data.asNoDate || "",
            status: data.status || "Pending",
            officerName: data.officerName || "",
            contactNumber: data.contactNumber || "",
            remarks: data.remarks || "",
            currentProgress: data.currentProgress || "",
          });

          if (data.related) {
            if (data.related.stateId) {
              setSelectedState(data.related.stateId);
              if (data.related.divisionId) {
                setSelectedDivision(data.related.divisionId);
              }
            }
            if (data.related.districtId) {
              // We don't need to manually set district if formik has it,
              // but we need to ensure the list is populated.
              // The useEffect dependencies [selectedDivision] -> fetchDistricts will handle list population.
              // Formik value matches the Option Value (Name or ID?)
              // Project uses Names for values. So Formik has 'Dhar'.
              // The Select uses 'dist.name' as value. So it works.
            }
          }
        }
      } catch (error: unknown) {
        handleError(error, "Failed to fetch project details");
        router.push("/project-summary");
      } finally {
        setFetching(false);
      }
    };
    fetchProject();
  }, [id]);

  const fetchStates = async () => {
    try {
      const { data } = await axios.get("/states");
      setStatesList(data.data || []);
    } catch (error: unknown) {
      handleError(error, "Failed to fetch states");
    }
  };

  const fetchDivisions = async (stateId: string) => {
    try {
      const { data } = await axios.get(`/divisions?state=${stateId}&limit=-1`);
      setDivisionsList(data.data || []);
    } catch (error: unknown) {
      handleError(error, "Failed to fetch divisions");
    }
  };

  const fetchDistricts = async (divisionId: string) => {
    try {
      const { data } = await axios.get(
        `/districts?division=${divisionId}&limit=-1`,
      );
      setDistrictsList(data.data || []);
    } catch (error: unknown) {
      handleError(error, "Failed to fetch districts");
    }
  };

  const fetchBlocks = async () => {
    try {
      const { data } = await axios.get("/blocks?limit=-1");
      setBlocksList(data.data || []);
    } catch (error: unknown) {
      handleError(error, "Failed to fetch blocks");
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data } = await axios.get("/departments?limit=-1");
      setDepartmentsList(data.data || []);
    } catch (error: unknown) {
      handleError(error, "Failed to fetch departments");
    }
  };

  if (fetching) {
    return (
      <>
        <ContentHeader title="Edit Project" />
        <section className="content">
          <div className="container-fluid px-4">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 p-8">
              <p className="text-center text-gray-600">
                Loading project details...
              </p>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <ContentHeader title="Edit Project" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 max-w-5xl mx-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                Update Project Details
              </h2>
              <p className="text-gray-600 mt-1">
                Modify the project information below.
              </p>
            </div>

            <form onSubmit={formik.handleSubmit} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>
                    State <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={selectedState}
                    onValueChange={setSelectedState}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {statesList.map((st: any) => (
                        <SelectItem key={st._id} value={st._id}>
                          {st.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>
                    Division <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={selectedDivision}
                    onValueChange={setSelectedDivision}
                    disabled={!selectedState}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select division" />
                    </SelectTrigger>
                    <SelectContent>
                      {divisionsList.map((div: any) => (
                        <SelectItem key={div._id} value={div._id}>
                          {div.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>
                    District <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formik.values.district}
                    onValueChange={(v) => formik.setFieldValue("district", v)}
                    disabled={!selectedDivision}
                  >
                    <SelectTrigger
                      className={
                        formik.touched.district && formik.errors.district
                          ? "border-red-500"
                          : ""
                      }
                    >
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      {districtsList.map((dist: any) => (
                        <SelectItem key={dist._id} value={dist.name}>
                          {dist.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formik.touched.district && formik.errors.district && (
                    <p className="text-red-500 text-xs">
                      {formik.errors.district}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    Block <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formik.values.block}
                    onValueChange={(v) => formik.setFieldValue("block", v)}
                  >
                    <SelectTrigger
                      className={
                        formik.touched.block && formik.errors.block
                          ? "border-red-500"
                          : ""
                      }
                    >
                      <SelectValue placeholder="Select block" />
                    </SelectTrigger>
                    <SelectContent>
                      {blocksList.map((blk: any) => (
                        <SelectItem key={blk._id} value={blk.name}>
                          {blk.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formik.touched.block && formik.errors.block && (
                    <p className="text-red-500 text-xs">
                      {formik.errors.block}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    Department <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formik.values.department}
                    onValueChange={(v) => formik.setFieldValue("department", v)}
                  >
                    <SelectTrigger
                      className={
                        formik.touched.department && formik.errors.department
                          ? "border-red-500"
                          : ""
                      }
                    >
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departmentsList.map((dept: any) => (
                        <SelectItem key={dept._id} value={dept.name}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formik.touched.department && formik.errors.department && (
                    <p className="text-red-500 text-xs">
                      {formik.errors.department}
                    </p>
                  )}
                </div>

                <div className="md:col-span-3 space-y-2">
                  <Label htmlFor="workName">
                    Work Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="workName"
                    name="workName"
                    value={formik.values.workName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter work name"
                    className={
                      formik.touched.workName && formik.errors.workName
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {formik.touched.workName && formik.errors.workName && (
                    <p className="text-red-500 text-xs">
                      {formik.errors.workName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectCost">
                    Project Cost (₹) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="projectCost"
                    name="projectCost"
                    type="number"
                    value={formik.values.projectCost}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter cost"
                    className={
                      formik.touched.projectCost && formik.errors.projectCost
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {formik.touched.projectCost && formik.errors.projectCost && (
                    <p className="text-red-500 text-xs">
                      {formik.errors.projectCost}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proposalEstimate">
                    Proposal Estimate (₹){" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="proposalEstimate"
                    name="proposalEstimate"
                    type="number"
                    value={formik.values.proposalEstimate}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter estimate"
                    className={
                      formik.touched.proposalEstimate &&
                      formik.errors.proposalEstimate
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {formik.touched.proposalEstimate &&
                    formik.errors.proposalEstimate && (
                      <p className="text-red-500 text-xs">
                        {formik.errors.proposalEstimate}
                      </p>
                    )}
                </div>

                <div className="space-y-2">
                  <Label>
                    Status <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formik.values.status}
                    onValueChange={(v) => formik.setFieldValue("status", v)}
                  >
                    <SelectTrigger
                      className={
                        formik.touched.status && formik.errors.status
                          ? "border-red-500"
                          : ""
                      }
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  {formik.touched.status && formik.errors.status && (
                    <p className="text-red-500 text-xs">
                      {formik.errors.status}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tsNoDate">TS No. / Date</Label>
                  <Input
                    id="tsNoDate"
                    name="tsNoDate"
                    value={formik.values.tsNoDate}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="e.g. TS-123 / 2025-01-01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="asNoDate">AS No. / Date</Label>
                  <Input
                    id="asNoDate"
                    name="asNoDate"
                    value={formik.values.asNoDate}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="e.g. AS-456 / 2025-02-01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="officerName">Officer Name</Label>
                  <Input
                    id="officerName"
                    name="officerName"
                    value={formik.values.officerName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter officer name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input
                    id="contactNumber"
                    name="contactNumber"
                    type="number"
                    value={formik.values.contactNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter contact number"
                    className={
                      formik.touched.contactNumber &&
                      formik.errors.contactNumber
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {formik.touched.contactNumber &&
                    formik.errors.contactNumber && (
                      <p className="text-red-500 text-xs">
                        {formik.errors.contactNumber}
                      </p>
                    )}
                </div>

                <div className="md:col-span-3 space-y-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    name="remarks"
                    value={formik.values.remarks}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter any remarks"
                    rows={4}
                  />
                </div>

                <div className="md:col-span-3 space-y-2">
                  <Label htmlFor="currentProgress">Current Progress</Label>
                  <Textarea
                    id="currentProgress"
                    name="currentProgress"
                    value={formik.values.currentProgress}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter current progress"
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 mt-10 pt-6 border-t border-gray-200">
                <Button
                  size="lg"
                  type="submit"
                  disabled={loading}
                  className="bg-[#00563B] hover:bg-[#368F8B]"
                >
                  {loading ? "Updating..." : "Update Project"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  type="button"
                  onClick={() => router.push("/project-summary")}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default EditProject;
