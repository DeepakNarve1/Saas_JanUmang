"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useFormik } from "formik";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";

import { ContentHeader } from "@app/components";
import { RouteGuard } from "@app/components/RouteGuard";
import { PERMISSIONS } from "@app/config/permissions";
import { Button } from "@app/components/ui/button";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import { Textarea } from "@app/components/ui/textarea";
import { Checkbox } from "@app/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@app/components/ui/select";

import { memberSchema, memberInitialValues } from "./member.schema";

const CODE_OPTIONS = [
  { label: "BC (बूथ कमेटी)", value: "BC" },
  { label: "PP (पेज प्रभारी)", value: "PP" },
  { label: "IP (प्रभावशाली व्यक्ति)", value: "IP" },
  { label: "FH (परिवार का मुखिया)", value: "FH" },
  { label: "SMM (सोशल मीडिया मित्र)", value: "SMM" },
  { label: "MS (महिला समिति)", value: "MS" },
  { label: "FP (फलिया प्रभारी)", value: "FP" },
  { label: "ER (चुनाव प्रभारी)", value: "ER" },
  { label: "वरिष्ठ", value: "वरिष्ठ" },
  { label: "युवा", value: "युवा" },
  { label: "BLA (बूथ लेवल एजेंट)", value: "BLA" },
  { label: "FM (दानदाता)", value: "FM" },
  { label: "AK (नवीन सदस्य को सक्रिय करना)", value: "AK" },
  { label: "वोटर प्रभारी (10 घर)", value: "वोटर प्रभारी" },
];

const VEHICLE_OPTIONS = [
  { label: "2 wheeler", value: "2 wheeler" },
  { label: "4 wheeler", value: "4 wheeler" },
  { label: "Koi Vahan nhi", value: "Koi Vahan nhi" },
];

const EditMember = () => {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");

  // Dynamic Lists
  const [districtsList, setDistrictsList] = useState<any[]>([]);
  const [blocksList, setBlocksList] = useState<any[]>([]);
  const [samitisList, setSamitisList] = useState<any[]>([]);
  const [panchayatsList, setPanchayatsList] = useState<any[]>([]);
  const [villagesList, setVillagesList] = useState<any[]>([]);
  const [boothsList, setBoothsList] = useState<any[]>([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchDistricts = async () => {
    try {
      const res = await axios.get("/districts?limit=-1");
      const list = res.data?.data || [];
      setDistrictsList(list);
      return list;
    } catch (err) {
      console.error("Failed to fetch districts", err);
      return [];
    }
  };

  const fetchSamitis = async () => {
    try {
      const res = await axios.get("/samiti?limit=-1");
      setSamitisList(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch samitis", err);
    }
  };

  const fetchBlocks = async (districtIdOrName: string) => {
    try {
      // Try to find by name if ID is passed or vice versa
      let district: any = districtsList.find(
        (d) => d.name === districtIdOrName || d._id === districtIdOrName,
      );
      if (!district) {
        const distRes = await axios.get("/districts?limit=-1");
        district = distRes.data?.data?.find(
          (d: any) => d.name === districtIdOrName || d._id === districtIdOrName,
        );
      }
      const res = await axios.get(
        `/blocks?limit=-1&district=${district?._id || districtIdOrName}`,
      );
      const list = res.data?.data || [];
      setBlocksList(list);
      return list;
    } catch (err) {
      console.error("Failed to fetch blocks", err);
      return [];
    }
  };

  const fetchPanchayats = async (blockIdOrName: string) => {
    try {
      let block = blocksList.find(
        (b) => b.name === blockIdOrName || b._id === blockIdOrName,
      );
      if (!block) {
        // This might happen during initial load
        const resB = await axios.get("/blocks?limit=-1");
        block = resB.data?.data?.find(
          (b: any) => b.name === blockIdOrName || b._id === blockIdOrName,
        );
      }
      const res = await axios.get(
        `/panchayat?limit=-1&block=${block?._id || blockIdOrName}`,
      );
      const list = res.data?.data || [];
      setPanchayatsList(list);
      return list;
    } catch (err) {
      console.error("Failed to fetch panchayats", err);
      return [];
    }
  };

  const fetchVillages = async (panchayatIdOrName: string) => {
    try {
      let gp = panchayatsList.find(
        (p) => p.name === panchayatIdOrName || p._id === panchayatIdOrName,
      );
      if (!gp) {
        const resP = await axios.get("/panchayat?limit=-1");
        gp = resP.data?.data?.find(
          (p: any) =>
            p.name === panchayatIdOrName || p._id === panchayatIdOrName,
        );
      }
      const res = await axios.get(
        `/villages?limit=-1&panchayat=${gp?._id || panchayatIdOrName}`,
      );
      const list = res.data?.data || [];
      setVillagesList(list);
      return list;
    } catch (err) {
      console.error("Failed to fetch villages", err);
      return [];
    }
  };

  const fetchBooths = async (blockIdOrName: string) => {
    try {
      let block = blocksList.find(
        (b) => b.name === blockIdOrName || b._id === blockIdOrName,
      );
      if (!block) {
        const resB = await axios.get("/blocks?limit=-1");
        block = resB.data?.data?.find(
          (b: any) => b.name === blockIdOrName || b._id === blockIdOrName,
        );
      }
      const res = await axios.get(
        `/booths?limit=-1&block=${block?._id || blockIdOrName}`,
      );
      const list = res.data?.data || [];
      setBoothsList(list);
      return list;
    } catch (err) {
      console.error("Failed to fetch booths", err);
      return [];
    }
  };

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await fetchDistricts();
      await fetchSamitis();

      if (id) {
        const { data } = await axios.get(`/members/${id}`);
        const memberData = data.data;

        // Populate dynamic lists based on member's existing data
        if (memberData.district) {
          const blocks = await fetchBlocks(memberData.district);
          if (memberData.block) {
            await fetchPanchayats(memberData.block);
            await fetchBooths(memberData.block);
            if (memberData.grampanchayat) {
              await fetchVillages(memberData.grampanchayat);
            }
          }
        }

        formik.setValues({
          name: memberData.name || "",
          voterId: memberData.voterId || "",
          mobile: memberData.mobile ? String(memberData.mobile) : "",
          fatherName: memberData.fatherName || "",
          dob: memberData.dob ? memberData.dob.split("T")[0] : "",
          dom: memberData.dom ? memberData.dom.split("T")[0] : "",
          district: memberData.district || "",
          block: memberData.block || "",
          boothName: memberData.boothName || "",
          boothNumber: memberData.boothNumber || "",
          grampanchayat: memberData.grampanchayat || "",
          village: memberData.village || "",
          samiti: memberData.samiti || "",
          toll: memberData.toll || "",
          jaati: memberData.jaati || "",
          age: memberData.age || 0,
          education: memberData.education || "",
          address: memberData.address || "",
          gender: memberData.gender || "",
          vehicle: memberData.vehicle || "",
          group: memberData.group || "",
          govtEmployee: memberData.govtEmployee || "",
          party: memberData.party || "",
          postYear: memberData.postYear || "",
          code: memberData.code || "",
          nariSammanYojna: memberData.nariSammanYojna || "",
          farmerLoanWaiver: memberData.farmerLoanWaiver || "",
          reference: memberData.reference || "",
          remark: memberData.remark || "",
          facebook: memberData.facebook || "",
          instagram: memberData.instagram || "",
          twitter: memberData.twitter || "",
          startLat: memberData.startLat || 0,
          startLong: memberData.startLong || 0,
          startDate: memberData.startDate
            ? memberData.startDate.split(".")[0]
            : "",
          endLat: memberData.endLat || 0,
          endLong: memberData.endLong || 0,
          endDate: memberData.endDate ? memberData.endDate.split(".")[0] : "",
          image: memberData.image || "",
        });
      }
    } catch (error: unknown) {
      toast.error("Failed to fetch member details");
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: memberInitialValues,
    validationSchema: memberSchema,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        const cleanedValues = {
          ...values,
          startLat:
            (values.startLat as any) === "" ? 0 : Number(values.startLat),
          startLong:
            (values.startLong as any) === "" ? 0 : Number(values.startLong),
          startDate: values.startDate === "" ? null : values.startDate,
          endLat: (values.endLat as any) === "" ? 0 : Number(values.endLat),
          endLong: (values.endLong as any) === "" ? 0 : Number(values.endLong),
          endDate: values.endDate === "" ? null : values.endDate,
          image: values.image === "" ? null : values.image,
        };
        await axios.put(`/members/${id}`, cleanedValues);
        toast.success("Member updated successfully");
        router.push("/member-list");
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || "Failed to update member");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleCheckboxChange = (
    field: "code" | "vehicle",
    value: string,
    checked: boolean,
  ) => {
    const currentValues = (
      formik.values[field] ? formik.values[field].split(",") : []
    ).filter((v) => v !== "");
    if (checked) {
      formik.setFieldValue(field, [...currentValues, value].join(","));
    } else {
      formik.setFieldValue(
        field,
        currentValues.filter((v) => v !== value).join(","),
      );
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500">Loading Form...</div>
    );

  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.EDIT_MEMBERS]}>
      <ContentHeader title="Edit Member Details" />
      <section className="content pb-10">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 p-8 max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8 border-b border-gray-100 dark:border-gray-800 pb-4">
              Update Survey Form
            </h2>
            <form onSubmit={formik.handleSubmit} className="space-y-8 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                {/* District */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-gray-700 dark:text-gray-300">
                    District
                  </Label>
                  <Select
                    onValueChange={(val) => {
                      const dist = districtsList.find((d) => d.name === val);
                      formik.setFieldValue("district", val);
                      if (dist?._id) fetchBlocks(dist._id);
                    }}
                    value={formik.values.district}
                  >
                    <SelectTrigger className="bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200">
                      <SelectValue placeholder="Select District" />
                    </SelectTrigger>
                    <SelectContent>
                      {districtsList.map((d) => (
                        <SelectItem key={d._id} value={d.name}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Samithi */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-gray-700 dark:text-gray-300">
                    Samithi
                  </Label>
                  <Select
                    onValueChange={(val) => formik.setFieldValue("samiti", val)}
                    value={formik.values.samiti}
                  >
                    <SelectTrigger className="bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200">
                      <SelectValue placeholder="Select Committee" />
                    </SelectTrigger>
                    <SelectContent>
                      {samitisList.map((s) => (
                        <SelectItem key={s._id} value={s.name}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Block Name */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-gray-700 dark:text-gray-300">
                    Block Name
                  </Label>
                  <Select
                    onValueChange={(val) => {
                      const block = blocksList.find((b) => b.name === val);
                      formik.setFieldValue("block", val);
                      if (block?._id) {
                        fetchPanchayats(block._id);
                        fetchBooths(block._id);
                      }
                    }}
                    value={formik.values.block}
                    disabled={!formik.values.district}
                  >
                    <SelectTrigger className="bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200">
                      <SelectValue placeholder="Select Block" />
                    </SelectTrigger>
                    <SelectContent>
                      {blocksList.map((b) => (
                        <SelectItem key={b._id} value={b.name}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Booth Name */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-gray-700 dark:text-gray-300">
                    Booth Name
                  </Label>
                  <Select
                    onValueChange={(val) => {
                      const booth = boothsList.find((b) => b.name === val);
                      formik.setFieldValue("boothName", val);
                      formik.setFieldValue("boothNumber", booth?.code || "");

                      // Auto-select Gram Panchayat linked to this Booth
                      if (booth && panchayatsList.length > 0) {
                        const linkedPanchayat = panchayatsList.find(
                          (p) =>
                            p.booth?._id === booth._id ||
                            p.booth?.name === val ||
                            p.booth === booth._id,
                        );
                        if (linkedPanchayat) {
                          formik.setFieldValue(
                            "grampanchayat",
                            linkedPanchayat.name,
                          );
                          fetchVillages(linkedPanchayat._id);
                        }
                      }
                    }}
                    value={formik.values.boothName}
                    disabled={!formik.values.block}
                  >
                    <SelectTrigger className="bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200">
                      <SelectValue placeholder="Select Booth" />
                    </SelectTrigger>
                    <SelectContent>
                      {boothsList.map((b) => (
                        <SelectItem key={b._id} value={b.name}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Booth Number */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-gray-700 dark:text-gray-300">
                    Booth Number
                  </Label>
                  <Input
                    name="boothNumber"
                    className="bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200"
                    value={formik.values.boothNumber}
                    onChange={formik.handleChange}
                    placeholder="Booth Number"
                    readOnly
                  />
                </div>

                {/* Spacer */}
                <div className="hidden lg:block"></div>

                {/* Gram Panchayat */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-gray-700 dark:text-gray-300">
                    Gram Panchayat
                  </Label>
                  <Select
                    onValueChange={(val) => {
                      const gp = panchayatsList.find((p) => p.name === val);
                      formik.setFieldValue("grampanchayat", val);
                      if (gp?._id) fetchVillages(gp._id);
                    }}
                    value={formik.values.grampanchayat}
                    disabled={!formik.values.block}
                  >
                    <SelectTrigger className="bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200">
                      <SelectValue placeholder="Select Panchayat" />
                    </SelectTrigger>
                    <SelectContent>
                      {panchayatsList.map((p) => (
                        <SelectItem key={p._id} value={p.name}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Village */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-gray-700 dark:text-gray-300">
                    Village
                  </Label>
                  <Input
                    name="village"
                    list="villages-options"
                    className="bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200"
                    value={formik.values.village}
                    onChange={formik.handleChange}
                    placeholder="Type or Select Village"
                  />
                  <datalist id="villages-options">
                    {villagesList.map((v) => (
                      <option key={v._id} value={v.name} />
                    ))}
                  </datalist>
                </div>

                {/* Spacer */}
                <div className="hidden lg:block"></div>

                {/* Majra/Falia/Tolla */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-gray-700 dark:text-gray-300">
                    Majra/Falia/Tolla
                  </Label>
                  <Input
                    name="toll"
                    className="bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200"
                    value={formik.values.toll}
                    onChange={formik.handleChange}
                  />
                </div>

                {/* Name */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-gray-700 dark:text-gray-300">
                    Name
                  </Label>
                  <Input
                    name="name"
                    className="bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                  />
                </div>

                {/* Spacer */}
                <div className="hidden lg:block"></div>

                {/* Father's Name */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-gray-700 dark:text-gray-300">
                    Father&apos;s Name
                  </Label>
                  <Input
                    name="fatherName"
                    className="bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200"
                    value={formik.values.fatherName}
                    onChange={formik.handleChange}
                  />
                </div>

                {/* Jati */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-gray-700 dark:text-gray-300">
                    Jati
                  </Label>
                  <Select
                    onValueChange={(val) => formik.setFieldValue("jaati", val)}
                    value={formik.values.jaati}
                  >
                    <SelectTrigger className="bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200">
                      <SelectValue placeholder="Select jaati" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ST">ST</SelectItem>
                      <SelectItem value="SC">SC</SelectItem>
                      <SelectItem value="OBC">OBC</SelectItem>
                      <SelectItem value="GEN">GEN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Spacer */}
                <div className="hidden lg:block"></div>

                {/* Date of Birth */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-gray-700 dark:text-gray-300">
                    Date of Birth
                  </Label>
                  <Input
                    type="date"
                    name="dob"
                    className="bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200"
                    value={formik.values.dob}
                    onChange={formik.handleChange}
                  />
                </div>

                {/* Age */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-gray-700 dark:text-gray-300">
                    Age
                  </Label>
                  <Input
                    type="text"
                    name="age"
                    inputMode="numeric"
                    className="bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200"
                    value={formik.values.age}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 3) {
                        formik.setFieldValue("age", value);
                      }
                    }}
                  />
                </div>

                {/* Spacer */}
                <div className="hidden lg:block"></div>

                {/* Date of Marriage */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-gray-700 dark:text-gray-300">
                    Date of Marriage
                  </Label>
                  <Input
                    type="date"
                    name="dom"
                    className="bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200"
                    value={formik.values.dom}
                    onChange={formik.handleChange}
                  />
                </div>

                {/* Education */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-gray-700 dark:text-gray-300">
                    Education
                  </Label>
                  <Select
                    onValueChange={(val) =>
                      formik.setFieldValue("education", val)
                    }
                    value={formik.values.education}
                  >
                    <SelectTrigger className="bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200">
                      <SelectValue placeholder="Select Education" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Literate">Literate</SelectItem>
                      <SelectItem value="Illiterate">Illiterate</SelectItem>
                      <SelectItem value="10th">10th</SelectItem>
                      <SelectItem value="12th">12th</SelectItem>
                      <SelectItem value="Graduate">Graduate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Spacer */}
                <div className="hidden lg:block"></div>

                {/* Mobile */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-gray-700 dark:text-gray-300">
                    Mobile
                  </Label>
                  <Input
                    name="mobile"
                    type="text"
                    maxLength={10}
                    inputMode="numeric"
                    className="bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200"
                    value={formik.values.mobile}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 10) {
                        formik.setFieldValue("mobile", value);
                        // trigger validation/touched if needed
                      }
                    }}
                    onBlur={formik.handleBlur}
                  />
                </div>

                {/* Votar Code */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-gray-700 dark:text-gray-300">
                    Votar Code
                  </Label>
                  <Input
                    name="voterId"
                    className="bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200"
                    value={formik.values.voterId}
                    onChange={formik.handleChange}
                  />
                </div>

                {/* Spacer */}
                <div className="hidden lg:block"></div>

                {/* Address */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-gray-700 dark:text-gray-300">
                    Address
                  </Label>
                  <Textarea
                    name="address"
                    className="bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200 min-h-[80px]"
                    value={formik.values.address}
                    onChange={formik.handleChange}
                  />
                </div>

                {/* Gender */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-gray-700 dark:text-gray-300">
                    Gender
                  </Label>
                  <Select
                    onValueChange={(val) => formik.setFieldValue("gender", val)}
                    value={formik.values.gender}
                  >
                    <SelectTrigger className="bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200">
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Spacer */}
                <div className="hidden lg:block"></div>

                {/* Group */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-gray-700 dark:text-gray-300">
                    Group
                  </Label>
                  <Input
                    name="group"
                    className="bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200"
                    value={formik.values.group}
                    onChange={formik.handleChange}
                  />
                </div>

                {/* Vehicle */}
                <div className="space-y-1.5 lg:pt-0 pt-4">
                  <Label className="font-bold text-gray-700 dark:text-gray-300">
                    Vehicle
                  </Label>
                  <div className="flex flex-col gap-2 pt-1">
                    {VEHICLE_OPTIONS.map((opt) => (
                      <div
                        key={opt.value}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`v-${opt.value}`}
                          checked={(formik.values.vehicle || "")
                            .split(",")
                            .includes(opt.value)}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange(
                              "vehicle",
                              opt.value,
                              !!checked,
                            )
                          }
                        />
                        <label
                          htmlFor={`v-${opt.value}`}
                          className="text-sm font-medium leading-none cursor-pointer dark:text-gray-400"
                        >
                          {opt.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Spacer */}
                <div className="hidden lg:block"></div>

                {/* Government Employee */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-gray-700 dark:text-gray-300">
                    Government Employee
                  </Label>
                  <Input
                    name="govtEmployee"
                    className="bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200"
                    value={formik.values.govtEmployee}
                    onChange={formik.handleChange}
                  />
                </div>

                {/* Party */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-gray-700 dark:text-gray-300">
                    Party
                  </Label>
                  <Select
                    onValueChange={(val) => formik.setFieldValue("party", val)}
                    value={formik.values.party}
                  >
                    <SelectTrigger className="bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200">
                      <SelectValue placeholder="Select Party" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BJP">BJP</SelectItem>
                      <SelectItem value="Congress">Congress</SelectItem>
                      <SelectItem value="AAP">AAP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Spacer */}
                <div className="hidden lg:block"></div>

                {/* Post-Year */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-gray-700 dark:text-gray-300">
                    Post-Year
                  </Label>
                  <Input
                    name="postYear"
                    type="number"
                    className="bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200 no-spinner"
                    value={formik.values.postYear}
                    onChange={formik.handleChange}
                  />
                </div>
              </div>

              {/* Code Section */}
              <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                <Label className="font-bold text-gray-700 dark:text-gray-200 text-lg mb-4 block">
                  Code
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-y-4 gap-x-2">
                  {CODE_OPTIONS.map((opt) => (
                    <div
                      key={opt.value}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`code-${opt.value}`}
                        checked={(formik.values.code || "")
                          .split(",")
                          .includes(opt.value)}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("code", opt.value, !!checked)
                        }
                      />
                      <label
                        htmlFor={`code-${opt.value}`}
                        className="text-xs font-medium leading-none cursor-pointer dark:text-gray-400"
                      >
                        {opt.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Other Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                {/* Nari Samman Yojna */}
                <div className="space-y-3">
                  <Label className="font-bold text-gray-700 dark:text-gray-300">
                    Nari Samman Yojna
                  </Label>
                  <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="radio"
                        id="nsy-yes"
                        name="nariSammanYojna"
                        value="Yes"
                        checked={formik.values.nariSammanYojna === "Yes"}
                        onChange={formik.handleChange}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <label
                        htmlFor="nsy-yes"
                        className="cursor-pointer dark:text-gray-400"
                      >
                        Yes
                      </label>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="radio"
                        id="nsy-no"
                        name="nariSammanYojna"
                        value="No"
                        checked={formik.values.nariSammanYojna === "No"}
                        onChange={formik.handleChange}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <label
                        htmlFor="nsy-no"
                        className="cursor-pointer dark:text-gray-400"
                      >
                        No
                      </label>
                    </div>
                  </div>
                </div>

                {/* Farmer Loan Waiver */}
                <div className="space-y-3">
                  <Label className="font-bold text-gray-700 dark:text-gray-300">
                    Farmer Loan Waiver
                  </Label>
                  <div className="flex gap-4 items-center">
                    {["Nahi", "Congress", "BJP"].map((opt) => (
                      <div key={opt} className="flex items-center gap-1.5">
                        <input
                          type="radio"
                          id={`flw-${opt}`}
                          name="farmerLoanWaiver"
                          value={opt}
                          checked={formik.values.farmerLoanWaiver === opt}
                          onChange={formik.handleChange}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <label
                          htmlFor={`flw-${opt}`}
                          className="cursor-pointer dark:text-gray-400"
                        >
                          {opt}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Social Links */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-gray-700 dark:text-gray-300">
                    Facebook
                  </Label>
                  <Input
                    name="facebook"
                    className="bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200"
                    value={formik.values.facebook}
                    onChange={formik.handleChange}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="font-bold text-gray-700 dark:text-gray-300">
                    Instagram
                  </Label>
                  <Input
                    name="instagram"
                    className="bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200"
                    value={formik.values.instagram}
                    onChange={formik.handleChange}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="font-bold text-gray-700 dark:text-gray-300">
                    Twitter
                  </Label>
                  <Input
                    name="twitter"
                    className="bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200"
                    value={formik.values.twitter}
                    onChange={formik.handleChange}
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-gray-700 dark:text-gray-300">
                    Image
                  </Label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4">
                      {formik.values.image && (
                        <div className="relative w-16 h-16 rounded-md overflow-hidden border border-gray-200 shrink-0">
                          <img
                            src={formik.values.image}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Choose File
                        </Button>
                        <span className="text-xs text-gray-500 dark:text-gray-400 py-2 truncate">
                          {fileName || "No file chosen"}
                        </span>
                      </div>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={(event) => {
                        const file = event.currentTarget.files?.[0];
                        if (file) {
                          if (file.size > 10 * 1024 * 1024) {
                            toast.error("File size exceeds 10MB");
                            return;
                          }
                          setFileName(file.name);
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            formik.setFieldValue("image", reader.result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Reference & Remark */}
                <div className="space-y-1.5">
                  <Label className="font-bold text-gray-700 dark:text-gray-300">
                    Reference
                  </Label>
                  <Input
                    name="reference"
                    className="bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200"
                    value={formik.values.reference}
                    onChange={formik.handleChange}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="font-bold text-gray-700 dark:text-gray-300">
                    Remark
                  </Label>
                  <Input
                    name="remark"
                    className="bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 dark:text-gray-200"
                    value={formik.values.remark}
                    onChange={formik.handleChange}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-start gap-4 pt-8">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#368F8B] hover:bg-[#2d7a76] text-white px-10 py-5 text-base font-semibold transition-all shadow-md"
                >
                  {isSubmitting ? "Updating..." : "Update Member"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="px-8 py-5 text-base dark:bg-[#202123] dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </RouteGuard>
  );
};

export default EditMember;
