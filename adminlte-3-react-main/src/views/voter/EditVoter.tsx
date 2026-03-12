"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useFormik } from "formik";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { handleError } from "@app/utils/errorHandler";
import { useAppSelector } from "@app/store/store";

import { Input } from "@app/components/ui/input";
import { Button } from "@app/components/ui/button";
import { Label } from "@app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";
import { ContentHeader } from "@app/components";
import { RouteGuard } from "@app/components/RouteGuard";
import { PERMISSIONS } from "@app/config/permissions";
import {
  voterSchema,
  voterInitialValues,
  IVoterFormValues,
} from "./voter.schema";

interface Block {
  _id: string;
  name: string;
}

interface Panchayat {
  _id: string;
  name: string;
}

interface Village {
  _id: string;
  name: string;
  booth?: string | { _id: string; name: string };
}

interface Booth {
  _id: string;
  name: string;
  code: string;
}

const EditVoter = () => {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.EDIT_VOTERS]}>
      <EditVoterContent />
    </RouteGuard>
  );
};

const EditVoterContent = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const currentUser = useAppSelector((state) => state.auth.currentUser);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Hierarchy Data
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [panchayats, setPanchayats] = useState<Panchayat[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [booths, setBooths] = useState<Booth[]>([]);

  // Selection States
  const [selectedBlockId, setSelectedBlockId] = useState("");
  const [selectedPanchayatId, setSelectedPanchayatId] = useState("");
  const [selectedVillageId, setSelectedVillageId] = useState("");
  const [selectedBoothId, setSelectedBoothId] = useState("");
  const [isBlockLocked, setIsBlockLocked] = useState(false);

  const formik = useFormik<IVoterFormValues>({
    initialValues: voterInitialValues,
    validationSchema: voterSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        // Resolve ObjectIDs for relational fields
        // The formik 'values' might contain names (strings), but the backend requires ObjectIDs.
        // We attempt to use the state variables first, or fallback to finding the ID from the list if the state is empty but name matches.

        let finalPanchayat = selectedPanchayatId;
        let finalVillage = selectedVillageId;

        // Fallback: If state is empty but name exists in values, try to find the ID from the lists
        if (!finalPanchayat && values.panchayat) {
          const p = panchayats.find((item) => item.name === values.panchayat);
          if (p) finalPanchayat = p._id;
        }
        if (!finalVillage && values.village) {
          const v = villages.find((item) => item.name === values.village);
          if (v) finalVillage = v._id;
        }

        const payload = {
          ...values,
          age: Number(values.age),
          // Override names with successfully resolved IDs
          panchayat: finalPanchayat || values.panchayat,
          village: finalVillage || values.village,
        };

        // Ensure ID is a string
        const voterId = Array.isArray(id) ? id[0] : id;

        await axios.put(`/voters/${voterId}`, payload);
        toast.success("Voter updated successfully!");
        router.push("/voter");
      } catch (error: unknown) {
        console.error("Update Error:", error);
        handleError(error, "Failed to update voter");
      } finally {
        setLoading(false);
      }
    },
  });

  // Fetch Blocks Helpers
  const fetchBlocksData = async () => {
    try {
      // Read user scope from Redux store (always fresh, never stale localStorage)
      const res = await axios.get("/blocks?limit=-1");
      if (res.data.success) {
        setBlocks(res.data.data);
        if (currentUser?.block) {
          setIsBlockLocked(true);
        }
      }
    } catch (error) {
      console.error("Error fetching blocks:", error);
    }
  };

  // Fetch Dependent Data Helpers
  const fetchPanchayats = async (blockId: string) => {
    try {
      const res = await axios.get(`/panchayat?limit=-1&block=${blockId}`);
      if (res.data.success) return res.data.data;
    } catch (error) {
      console.error("Error fetching panchayats:", error);
    }
    return [];
  };

  const fetchVillages = async (panchayatId: string) => {
    try {
      const res = await axios.get(
        `/villages?limit=-1&panchayat=${panchayatId}`,
      );
      if (res.data.success) return res.data.data;
    } catch (error) {
      console.error("Error fetching villages:", error);
    }
    return [];
  };

  const fetchBooths = async (blockId: string) => {
    try {
      const res = await axios.get(`/booths?limit=-1&block=${blockId}`);
      if (res.data.success) return res.data.data;
    } catch (error) {
      console.error("Error fetching booths:", error);
    }
    return [];
  };

  // Main Effect to load Voter and Cascade
  useEffect(() => {
    const initVoter = async () => {
      try {
        const voterRes = await axios.get(`/voters/${id}`);
        if (!voterRes.data || !voterRes.data.data) {
          throw new Error("Voter not found");
        }

        const v = voterRes.data.data;
        formik.setValues({
          name: v.name || "",
          fatherName: v.fatherName || "",
          mobileNumber: v.mobileNumber || "",
          age: v.age || "",
          cast: v.cast || "",
          subcast: v.subcast || "",
          fulladdress: v.fulladdress || "",
          blockname: v.blockname || "",
          boothname: v.boothname || "",
          boothno: v.boothno || "",
          panchayat: v.panchayat || "",
          village: v.village || "",
          fallaMarjra: v.fallaMarjra || "",
          voterId: v.voterId || "",
          image: v.image || "",
        });

        // 2. Fetch Blocks
        const blocksRes = await axios.get("/blocks?limit=-1");
        const allBlocks: Block[] = blocksRes.data.data || [];
        setBlocks(allBlocks);

        const matchedBlock = allBlocks.find((b) => b.name === v.blockname);
        if (matchedBlock) {
          setSelectedBlockId(matchedBlock._id);
          const [panchayatsList, boothsList] = await Promise.all([
            fetchPanchayats(matchedBlock._id),
            fetchBooths(matchedBlock._id),
          ]);
          setPanchayats(panchayatsList);
          setBooths(boothsList);

          const matchedPanchayat = (panchayatsList as Panchayat[]).find(
            (p) => p.name === v.panchayat,
          );
          if (matchedPanchayat) {
            setSelectedPanchayatId(matchedPanchayat._id);
            const villagesList = await fetchVillages(matchedPanchayat._id);
            setVillages(villagesList);
            const matchedVillage = (villagesList as Village[]).find(
              (vil) => vil.name === v.village,
            );
            if (matchedVillage) {
              setSelectedVillageId(matchedVillage._id);
            }
          }

          const matchedBooth = (boothsList as Booth[]).find(
            (b) => b.name === v.boothname,
          );
          if (matchedBooth) {
            setSelectedBoothId(matchedBooth._id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch voter sequence", error);
        toast.error("Failed to load voter details");
        router.push("/voter");
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) {
      initVoter();
    }
  }, [id, router]);

  // Handlers
  const handleBlockChange = async (blockId: string) => {
    setSelectedBlockId(blockId);
    const block = blocks.find((b) => b._id === blockId);
    formik.setFieldValue("blockname", block ? block.name : "");
    formik.setFieldValue("panchayat", "");
    formik.setFieldValue("village", "");
    formik.setFieldValue("boothname", "");
    formik.setFieldValue("boothno", "");

    setSelectedPanchayatId("");
    setSelectedVillageId("");
    setSelectedBoothId("");

    const pList = await fetchPanchayats(blockId);
    setPanchayats(pList);
    const bList = await fetchBooths(blockId);
    setBooths(bList);
  };

  const handlePanchayatChange = async (panchayatId: string) => {
    setSelectedPanchayatId(panchayatId);
    const panchayat = panchayats.find((p) => p._id === panchayatId);
    formik.setFieldValue("panchayat", panchayat ? panchayat.name : "");
    formik.setFieldValue("village", "");
    setSelectedVillageId("");
    const vList = await fetchVillages(panchayatId);
    setVillages(vList);
  };

  const handleVillageChange = (villageId: string) => {
    setSelectedVillageId(villageId);
    const village = villages.find((v) => v._id === villageId);
    formik.setFieldValue("village", village ? village.name : "");
    if (village && village.booth) {
      const boothId =
        typeof village.booth === "object" ? village.booth._id : village.booth;
      const booth = booths.find((b) => b._id === boothId);
      if (booth) {
        setSelectedBoothId(booth._id);
        formik.setFieldValue("boothname", booth.name);
        formik.setFieldValue("boothno", booth.code);
      }
    }
  };

  const handleBoothChange = (boothId: string) => {
    setSelectedBoothId(boothId);
    const booth = booths.find((b) => b._id === boothId);
    formik.setFieldValue("boothname", booth ? booth.name : "");
    formik.setFieldValue("boothno", booth ? booth.code : "");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        formik.setFieldValue("image", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (initialLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <>
      <ContentHeader title="Edit Voter" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 max-w-6xl mx-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                Edit Voter Details
              </h2>
            </div>

            <form onSubmit={formik.handleSubmit} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Voter Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Voter Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={
                      formik.touched.name && formik.errors.name
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {formik.touched.name && formik.errors.name && (
                    <p className="text-red-500 text-xs">{formik.errors.name}</p>
                  )}
                </div>

                {/* Father Name */}
                <div className="space-y-2">
                  <Label htmlFor="fatherName">
                    Father Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fatherName"
                    name="fatherName"
                    value={formik.values.fatherName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={
                      formik.touched.fatherName && formik.errors.fatherName
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {formik.touched.fatherName && formik.errors.fatherName && (
                    <p className="text-red-500 text-xs">
                      {formik.errors.fatherName}
                    </p>
                  )}
                </div>

                {/* Mobile Number */}
                <div className="space-y-2">
                  <Label htmlFor="mobileNumber">
                    Mobile Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="mobileNumber"
                    name="mobileNumber"
                    type="text"
                    maxLength={10}
                    inputMode="numeric"
                    value={formik.values.mobileNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 10) {
                        formik.setFieldValue("mobileNumber", value);
                      }
                    }}
                    onBlur={formik.handleBlur}
                    className={
                      formik.touched.mobileNumber && formik.errors.mobileNumber
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {formik.touched.mobileNumber &&
                    formik.errors.mobileNumber && (
                      <p className="text-red-500 text-xs">
                        {formik.errors.mobileNumber}
                      </p>
                    )}
                </div>

                {/* Age */}
                <div className="space-y-2">
                  <Label htmlFor="age">
                    Age <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="age"
                    type="text"
                    name="age"
                    inputMode="numeric"
                    value={formik.values.age}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 3) {
                        formik.setFieldValue("age", value);
                      }
                    }}
                    onBlur={formik.handleBlur}
                    className={
                      formik.touched.age && formik.errors.age
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {formik.touched.age && formik.errors.age && (
                    <p className="text-red-500 text-xs">{formik.errors.age}</p>
                  )}
                </div>

                {/* Caste */}
                <div className="space-y-2">
                  <Label htmlFor="cast">
                    Caste <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="cast"
                    name="cast"
                    value={formik.values.cast}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={
                      formik.touched.cast && formik.errors.cast
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {formik.touched.cast && formik.errors.cast && (
                    <p className="text-red-500 text-xs">{formik.errors.cast}</p>
                  )}
                </div>

                {/* Sub-Caste */}
                <div className="space-y-2">
                  <Label htmlFor="subcast">
                    Sub-Caste <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="subcast"
                    name="subcast"
                    value={formik.values.subcast}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={
                      formik.touched.subcast && formik.errors.subcast
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {formik.touched.subcast && formik.errors.subcast && (
                    <p className="text-red-500 text-xs">
                      {formik.errors.subcast}
                    </p>
                  )}
                </div>

                {/* Full Address */}
                <div className="space-y-2 md:col-span-3">
                  <Label htmlFor="fulladdress">
                    Full Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fulladdress"
                    name="fulladdress"
                    value={formik.values.fulladdress}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={
                      formik.touched.fulladdress && formik.errors.fulladdress
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {formik.touched.fulladdress && formik.errors.fulladdress && (
                    <p className="text-red-500 text-xs">
                      {formik.errors.fulladdress}
                    </p>
                  )}
                </div>

                {/* Block Name */}
                <div className="space-y-2">
                  <Label>
                    Block Name <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={selectedBlockId}
                    onValueChange={handleBlockChange}
                    disabled={isBlockLocked}
                  >
                    <SelectTrigger
                      className={
                        formik.touched.blockname && formik.errors.blockname
                          ? "border-red-500"
                          : ""
                      }
                    >
                      <SelectValue placeholder="Select Block" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {blocks.map((block) => (
                        <SelectItem key={block._id} value={block._id}>
                          {block.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formik.touched.blockname && formik.errors.blockname && (
                    <p className="text-red-500 text-xs">
                      {formik.errors.blockname}
                    </p>
                  )}
                </div>

                {/* Booth Name */}
                <div className="space-y-2">
                  <Label>
                    Booth Name <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={selectedBoothId}
                    onValueChange={handleBoothChange}
                    disabled={!selectedBlockId}
                  >
                    <SelectTrigger
                      className={
                        formik.touched.boothname && formik.errors.boothname
                          ? "border-red-500"
                          : ""
                      }
                    >
                      <SelectValue placeholder="Select Booth" />
                    </SelectTrigger>
                    <SelectContent>
                      {booths.map((item) => (
                        <SelectItem key={item._id} value={item._id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formik.touched.boothname && formik.errors.boothname && (
                    <p className="text-red-500 text-xs">
                      {formik.errors.boothname}
                    </p>
                  )}
                </div>

                {/* Booth No */}
                <div className="space-y-2">
                  <Label htmlFor="boothno">
                    Booth No <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="boothno"
                    name="boothno"
                    value={formik.values.boothno}
                    readOnly
                    className="bg-gray-100"
                  />
                  {formik.touched.boothno && formik.errors.boothno && (
                    <p className="text-red-500 text-xs">
                      {formik.errors.boothno}
                    </p>
                  )}
                </div>

                {/* Panchayat */}
                <div className="space-y-2">
                  <Label>
                    Panchayat <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={selectedPanchayatId}
                    onValueChange={handlePanchayatChange}
                    disabled={!selectedBlockId}
                  >
                    <SelectTrigger
                      className={
                        formik.touched.panchayat && formik.errors.panchayat
                          ? "border-red-500"
                          : ""
                      }
                    >
                      <SelectValue placeholder="Select Panchayat" />
                    </SelectTrigger>
                    <SelectContent>
                      {panchayats.map((item) => (
                        <SelectItem key={item._id} value={item._id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formik.touched.panchayat && formik.errors.panchayat && (
                    <p className="text-red-500 text-xs">
                      {formik.errors.panchayat}
                    </p>
                  )}
                </div>

                {/* Village */}
                <div className="space-y-2">
                  <Label>
                    Village <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={selectedVillageId}
                    onValueChange={handleVillageChange}
                    disabled={!selectedPanchayatId}
                  >
                    <SelectTrigger
                      className={
                        formik.touched.village && formik.errors.village
                          ? "border-red-500"
                          : ""
                      }
                    >
                      <SelectValue placeholder="Select Village" />
                    </SelectTrigger>
                    <SelectContent>
                      {villages.map((item) => (
                        <SelectItem key={item._id} value={item._id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formik.touched.village && formik.errors.village && (
                    <p className="text-red-500 text-xs">
                      {formik.errors.village}
                    </p>
                  )}
                </div>

                {/* Falla/Marjra */}
                <div className="space-y-2">
                  <Label htmlFor="fallaMarjra">
                    Falla/Marjra <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fallaMarjra"
                    name="fallaMarjra"
                    value={formik.values.fallaMarjra}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={
                      formik.touched.fallaMarjra && formik.errors.fallaMarjra
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {formik.touched.fallaMarjra && formik.errors.fallaMarjra && (
                    <p className="text-red-500 text-xs">
                      {formik.errors.fallaMarjra}
                    </p>
                  )}
                </div>

                {/* Voter ID */}
                <div className="space-y-2">
                  <Label htmlFor="voterId">
                    Voter ID (Epic) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="voterId"
                    name="voterId"
                    value={formik.values.voterId}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={
                      formik.touched.voterId && formik.errors.voterId
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {formik.touched.voterId && formik.errors.voterId && (
                    <p className="text-red-500 text-xs">
                      {formik.errors.voterId}
                    </p>
                  )}
                </div>

                {/* Image */}
                <div className="space-y-2">
                  <Label>Voter Image (Optional)</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="cursor-pointer"
                  />
                  {formik.values.image && (
                    <div className="mt-2 relative w-24 h-24">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formik.values.image}
                        alt="Preview"
                        className="w-full h-full object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => formik.setFieldValue("image", "")}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs"
                      >
                        X
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 mt-10 pt-6 border-t border-gray-200">
                <Button
                  size="lg"
                  type="submit"
                  disabled={loading}
                  className="bg-[#00563B] hover:bg-[#368F8B]"
                >
                  {loading ? "Updating..." : "Update Voter"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  type="button"
                  onClick={() => router.push("/voter")}
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

export default EditVoter;
