"use client";

import { useState, useEffect } from "react";
import { useFormik } from "formik";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { useAppSelector } from "@app/store/store";

import { Button } from "@app/components/ui/button";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";
import { Textarea } from "@app/components/ui/textarea";
import { visitorSchema, visitorInitialValues } from "./visitor.schema";
import { IDistrict } from "@app/types/district";
import { IAssembly } from "@app/types/assembly";
import { IBlock } from "@app/types/block";
import { IVisitorFormValues } from "@app/types/visitor";

type EntityType = IDistrict | IAssembly | IBlock;

interface VisitorFormProps {
  initialValues?: IVisitorFormValues;
  onSubmit: (values: IVisitorFormValues) => void;
  loading?: boolean;
}

const VisitorForm = ({
  initialValues = visitorInitialValues,
  onSubmit,
  loading = false,
}: VisitorFormProps) => {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const [districts, setDistricts] = useState<IDistrict[]>([]);
  const [assemblies, setAssemblies] = useState<IAssembly[]>([]);
  const [blocks, setBlocks] = useState<IBlock[]>([]);

  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [selectedAssemblyId, setSelectedAssemblyId] = useState("");
  const [selectedBlockId, setSelectedBlockId] = useState("");
  const [lockedFields, setLockedFields] = useState({
    district: false,
    vidhansabha: false,
    block: false,
  });

  const formik = useFormik<IVisitorFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: visitorSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  // Initialization & RBAC
  useEffect(() => {
    // HELPER: Find entity by ID or Name from a list
    const findInList = <T extends EntityType>(
      list: T[],
      val: string,
    ): T | null => {
      if (!val) return null;
      return (
        list.find(
          (item) =>
            item._id === val || item.name?.toLowerCase() === val.toLowerCase(),
        ) || null
      );
    };

    // HELPER: Fetch entity by ID or Name
    const resolveEntity = async (
      type: "blocks" | "assemblies" | "districts",
      val: string,
      list: EntityType[],
    ): Promise<any> => {
      if (!val) return null;
      // 1. Try by ID
      try {
        const res = await axios.get(`/${type}/${val}`);
        if (res.data.success) return res.data.data;
      } catch (e) {
        // Ignore error (likely not an ID)
      }
      // 2. Try finding in list (if provided)
      const found = findInList(list, val);
      if (found) return found;

      // 3. Last Config: Search by Name specifically
      try {
        const res = await axios.get(`/${type}?name=${val}&limit=1`);
        if (res.data.data && res.data.data.length > 0) {
          return res.data.data[0];
        }
      } catch (e) {
        return null;
      }
      return null;
    };

    const init = async () => {
      try {
        // Read user scope from Redux store (always fresh, never stale localStorage)
        const user = currentUser;

        // Default: Unlock everything & Load Districts
        setLockedFields({ district: false, vidhansabha: false, block: false });
        const distRes = await axios.get("/districts?limit=-1");
        const allDistricts = distRes.data.data || [];
        setDistricts(allDistricts);

        if (user) {
          const uBlock = user.block;
          const uAssembly = user.vidhansabha || user.assembly;
          const uDistrict = user.district;

          // CASE 1: BLOCK ASSIGNED
          if (uBlock) {
            const blockData = await resolveEntity("blocks", uBlock, []);

            if (blockData) {
              // Determine District and Assembly
              let bDistrict = blockData.district;
              let bAssembly = blockData.assembly;

              // If they are just IDs, resolve them
              let distObj: IDistrict | null =
                typeof bDistrict === "object" ? bDistrict : null;
              let assObj: IAssembly | null =
                typeof bAssembly === "object" ? bAssembly : null;

              if (!distObj && bDistrict) {
                try {
                  const r = await axios.get(`/districts/${bDistrict}`);
                  distObj = r.data.data;
                } catch (e) {}
              }
              if (!assObj && bAssembly) {
                try {
                  const r = await axios.get(`/assemblies/${bAssembly}`);
                  assObj = r.data.data;
                } catch (e) {}
              }

              if (distObj && assObj) {
                setLockedFields({
                  district: true,
                  vidhansabha: true,
                  block: true,
                });
                setDistricts([distObj]);
                setAssemblies([assObj]);
                setBlocks([blockData]);

                setSelectedDistrictId(distObj._id);
                formik.setFieldValue("district", distObj.name);

                setSelectedAssemblyId(assObj._id);
                formik.setFieldValue("vidhansabha", assObj.name);

                setSelectedBlockId(blockData._id);
                formik.setFieldValue("block", blockData.name);
              }
            }
          }

          // CASE 2: ASSEMBLY ASSIGNED
          else if (uAssembly) {
            const assData = await resolveEntity("assemblies", uAssembly, []);

            if (assData) {
              let aDistrict = assData.district;
              let distObj: IDistrict | null =
                typeof aDistrict === "object" ? aDistrict : null;

              if (!distObj && aDistrict) {
                try {
                  const r = await axios.get(`/districts/${aDistrict}`);
                  distObj = r.data.data;
                } catch (e) {}
              }

              if (distObj) {
                setLockedFields({
                  district: true,
                  vidhansabha: true,
                  block: false,
                });
                setDistricts([distObj]);
                setAssemblies([assData]);

                setSelectedDistrictId(distObj._id);
                formik.setFieldValue("district", distObj.name);

                setSelectedAssemblyId(assData._id);
                formik.setFieldValue("vidhansabha", assData.name);

                // Fetch unlocked blocks
                const bRes = await axios.get(
                  `/blocks?limit=-1&assembly=${assData._id}`,
                );
                setBlocks(bRes.data.data || []);
              }
            }
          }

          // CASE 3: DISTRICT ASSIGNED
          else if (uDistrict) {
            // We already have allDistricts
            const distObj = findInList(allDistricts, uDistrict);

            if (distObj) {
              setLockedFields({
                district: true,
                vidhansabha: false,
                block: false,
              });
              setDistricts([distObj]);

              setSelectedDistrictId(distObj._id);
              formik.setFieldValue("district", distObj.name);

              // Fetch unlocked assemblies
              const aRes = await axios.get(
                `/assemblies?limit=-1&district=${distObj._id}`,
              );
              setAssemblies(aRes.data.data || []);
            }
          }
        }

        // Handle Edit Mode / Validation Errors (retain selected values)
        if (initialValues.district) {
          const d = allDistricts.find(
            (d: IDistrict) => d.name === initialValues.district,
          );
          if (d) {
            setSelectedDistrictId(d._id);
            // We need to wait for assemblies to load if we want to select vidhansabha
            const assRes = await axios.get(
              `/assemblies?limit=-1&district=${d._id}`,
            );
            const fetchedAss = assRes.data.data || [];
            setAssemblies(fetchedAss);

            if (initialValues.vidhansabha) {
              const a = fetchedAss.find(
                (a: IAssembly) => a.name === initialValues.vidhansabha,
              );
              if (a) {
                setSelectedAssemblyId(a._id);
                const blkRes = await axios.get(
                  `/blocks?limit=-1&assembly=${a._id}`,
                );
                const fetchedBlocks = blkRes.data.data || [];
                setBlocks(fetchedBlocks);

                if (initialValues.block) {
                  const b = fetchedBlocks.find(
                    (b: IBlock) => b.name === initialValues.block,
                  );
                  if (b) setSelectedBlockId(b._id);
                }
              }
            }
          }
        }
      } catch (error: unknown) {
        console.error("Initialization error:", error);
      }
    };
    init();
  }, [initialValues.district]); // Warning: logic might loop if not careful, but init runs once usually due to empty dep in real usage or check

  // Handlers
  const handleDistrictChange = async (dId: string) => {
    setSelectedDistrictId(dId);
    const d = districts.find((x) => x._id === dId);
    formik.setFieldValue("district", d ? d.name : "");

    setSelectedAssemblyId("");
    setAssemblies([]);
    formik.setFieldValue("vidhansabha", "");

    setSelectedBlockId("");
    setBlocks([]);
    formik.setFieldValue("block", "");

    if (dId) {
      try {
        const res = await axios.get(`/assemblies?limit=-1&district=${dId}`);
        if (res.data.success) setAssemblies(res.data.data);
      } catch (error: unknown) {
        console.error(error);
      }
    }
  };

  const handleAssemblyChange = async (aId: string) => {
    setSelectedAssemblyId(aId);
    const a = assemblies.find((x) => x._id === aId);
    formik.setFieldValue("vidhansabha", a ? a.name : "");

    setSelectedBlockId("");
    setBlocks([]);
    formik.setFieldValue("block", "");

    if (aId) {
      try {
        const res = await axios.get(`/blocks?limit=-1&assembly=${aId}`);
        if (res.data.success) setBlocks(res.data.data);
      } catch (error: unknown) {
        console.error(error);
      }
    }
  };

  const handleBlockChange = (bId: string) => {
    setSelectedBlockId(bId);
    const b = blocks.find((x) => x._id === bId);
    formik.setFieldValue("block", b ? b.name : "");
  };

  return (
    <form onSubmit={formik.handleSubmit} className="p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* District */}
        <div className="space-y-2">
          <Label>
            District <span className="text-red-500">*</span>
          </Label>
          <Select
            value={selectedDistrictId || ""}
            onValueChange={handleDistrictChange}
            disabled={lockedFields.district}
          >
            <SelectTrigger
              className={
                formik.touched.district && formik.errors.district
                  ? "border-red-500"
                  : ""
              }
            >
              <SelectValue placeholder="Select District" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {districts.map((d) => (
                <SelectItem key={d._id} value={d._id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formik.touched.district && formik.errors.district && (
            <div className="text-red-500 text-xs">{formik.errors.district}</div>
          )}
        </div>

        {/* Vidhansabha */}
        <div className="space-y-2">
          <Label>
            Vidhansabha <span className="text-red-500">*</span>
          </Label>
          <Select
            value={selectedAssemblyId || ""}
            onValueChange={handleAssemblyChange}
            disabled={lockedFields.vidhansabha || !selectedDistrictId}
          >
            <SelectTrigger
              className={
                formik.touched.vidhansabha && formik.errors.vidhansabha
                  ? "border-red-500"
                  : ""
              }
            >
              <SelectValue placeholder="Select Vidhansabha" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {assemblies.map((a) => (
                <SelectItem key={a._id} value={a._id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formik.touched.vidhansabha && formik.errors.vidhansabha && (
            <div className="text-red-500 text-xs">
              {formik.errors.vidhansabha}
            </div>
          )}
        </div>

        {/* Block */}
        <div className="space-y-2">
          <Label>
            Block <span className="text-red-500">*</span>
          </Label>
          <Select
            value={selectedBlockId || ""}
            onValueChange={handleBlockChange}
            disabled={lockedFields.block || !selectedAssemblyId}
          >
            <SelectTrigger
              className={
                formik.touched.block && formik.errors.block
                  ? "border-red-500"
                  : ""
              }
            >
              <SelectValue placeholder="Select Block" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {blocks.map((b) => (
                <SelectItem key={b._id} value={b._id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formik.touched.block && formik.errors.block && (
            <div className="text-red-500 text-xs">{formik.errors.block}</div>
          )}
        </div>

        {/* Date */}
        <div className="space-y-2">
          <Label htmlFor="date">
            Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="date"
            name="date"
            type="date"
            value={formik.values.date}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={
              formik.touched.date && formik.errors.date ? "border-red-500" : ""
            }
          />
          {formik.touched.date && formik.errors.date && (
            <div className="text-red-500 text-xs">{formik.errors.date}</div>
          )}
        </div>

        {/* Time */}
        <div className="space-y-2">
          <Label htmlFor="time">
            Time <span className="text-red-500">*</span>
          </Label>
          <Input
            id="time"
            name="time"
            type="time"
            value={formik.values.time}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={
              formik.touched.time && formik.errors.time ? "border-red-500" : ""
            }
          />
          {formik.touched.time && formik.errors.time && (
            <div className="text-red-500 text-xs">{formik.errors.time}</div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={
              formik.touched.name && formik.errors.name ? "border-red-500" : ""
            }
          />
          {formik.touched.name && formik.errors.name && (
            <div className="text-red-500 text-xs">{formik.errors.name}</div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="mobileNumber">
            Mobile No. <span className="text-red-500">*</span>
          </Label>
          <Input
            id="mobileNumber"
            name="mobileNumber"
            maxLength={10}
            value={formik.values.mobileNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              if (value.length <= 10) {
                formik.setFieldValue("mobileNumber", value);
              }
            }}
            onBlur={formik.handleBlur}
            inputMode="numeric"
            className={
              formik.touched.mobileNumber && formik.errors.mobileNumber
                ? "border-red-500"
                : ""
            }
          />
          {formik.touched.mobileNumber && formik.errors.mobileNumber && (
            <div className="text-red-500 text-xs">
              {formik.errors.mobileNumber}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">
            Category <span className="text-red-500">*</span>
          </Label>
          <Input
            id="category"
            name="category"
            value={formik.values.category}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={
              formik.touched.category && formik.errors.category
                ? "border-red-500"
                : ""
            }
          />
          {formik.touched.category && formik.errors.category && (
            <div className="text-red-500 text-xs">{formik.errors.category}</div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="post">
            Post <span className="text-red-500">*</span>
          </Label>
          <Input
            id="post"
            name="post"
            value={formik.values.post}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={
              formik.touched.post && formik.errors.post ? "border-red-500" : ""
            }
          />
          {formik.touched.post && formik.errors.post && (
            <div className="text-red-500 text-xs">{formik.errors.post}</div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="place">
            Place <span className="text-red-500">*</span>
          </Label>
          <Input
            id="place"
            name="place"
            value={formik.values.place}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={
              formik.touched.place && formik.errors.place
                ? "border-red-500"
                : ""
            }
          />
          {formik.touched.place && formik.errors.place && (
            <div className="text-red-500 text-xs">{formik.errors.place}</div>
          )}
        </div>

        <div className="space-y-2">
          <Label>
            Incoming / Visitor <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formik.values.incomingVisitor}
            onValueChange={(val) =>
              formik.setFieldValue("incomingVisitor", val)
            }
          >
            <SelectTrigger
              className={
                formik.touched.incomingVisitor && formik.errors.incomingVisitor
                  ? "border-red-500"
                  : ""
              }
            >
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VISITOR">Visitor</SelectItem>
              <SelectItem value="INCOMING">Incoming</SelectItem>
            </SelectContent>
          </Select>
          {formik.touched.incomingVisitor && formik.errors.incomingVisitor && (
            <div className="text-red-500 text-xs">
              {formik.errors.incomingVisitor}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>
            Visitor Type <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formik.values.visitorType}
            onValueChange={(val) => formik.setFieldValue("visitorType", val)}
          >
            <SelectTrigger
              className={
                formik.touched.visitorType && formik.errors.visitorType
                  ? "border-red-500"
                  : ""
              }
            >
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="General Visitor">General Visitor</SelectItem>
              <SelectItem value="Problem">Problem</SelectItem>
            </SelectContent>
          </Select>
          {formik.touched.visitorType && formik.errors.visitorType && (
            <div className="text-red-500 text-xs">
              {formik.errors.visitorType}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="attendBy">
            Attend By <span className="text-red-500">*</span>
          </Label>
          <Input
            id="attendBy"
            name="attendBy"
            value={formik.values.attendBy}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={
              formik.touched.attendBy && formik.errors.attendBy
                ? "border-red-500"
                : ""
            }
          />
          {formik.touched.attendBy && formik.errors.attendBy && (
            <div className="text-red-500 text-xs">{formik.errors.attendBy}</div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="addedBy">
            Added By <span className="text-red-500">*</span>
          </Label>
          <Input
            id="addedBy"
            name="addedBy"
            value={formik.values.addedBy}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={
              formik.touched.addedBy && formik.errors.addedBy
                ? "border-red-500"
                : ""
            }
          />
          {formik.touched.addedBy && formik.errors.addedBy && (
            <div className="text-red-500 text-xs">{formik.errors.addedBy}</div>
          )}
        </div>

        <div className="space-y-2 md:col-span-3">
          <Label htmlFor="message">
            Message <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="message"
            name="message"
            value={formik.values.message}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={
              formik.touched.message && formik.errors.message
                ? "border-red-500"
                : ""
            }
          />
          {formik.touched.message && formik.errors.message && (
            <div className="text-red-500 text-xs">{formik.errors.message}</div>
          )}
        </div>

        <div className="space-y-2 md:col-span-3">
          <Label htmlFor="remarks">
            REMARK (क्या कारवाही की गई) <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="remarks"
            name="remarks"
            value={formik.values.remarks}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={
              formik.touched.remarks && formik.errors.remarks
                ? "border-red-500"
                : ""
            }
          />
          {formik.touched.remarks && formik.errors.remarks && (
            <div className="text-red-500 text-xs">{formik.errors.remarks}</div>
          )}
        </div>

        <div className="space-y-2 md:col-span-3">
          <Label htmlFor="bhaiyakanirdesh">
            भईया के निर्देश <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="bhaiyakanirdesh"
            name="bhaiyakanirdesh"
            value={formik.values.bhaiyakanirdesh}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={
              formik.touched.bhaiyakanirdesh && formik.errors.bhaiyakanirdesh
                ? "border-red-500"
                : ""
            }
          />
          {formik.touched.bhaiyakanirdesh && formik.errors.bhaiyakanirdesh && (
            <div className="text-red-500 text-xs">
              {formik.errors.bhaiyakanirdesh}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-200">
        <Button
          size="lg"
          type="submit"
          disabled={loading}
          className="bg-[#00563B] hover:bg-[#368F8B]"
        >
          {loading ? "Submitting..." : "Save Visitor"}
        </Button>
        <Button
          size="lg"
          variant="outline"
          type="button"
          onClick={() => window.history.back()}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default VisitorForm;
