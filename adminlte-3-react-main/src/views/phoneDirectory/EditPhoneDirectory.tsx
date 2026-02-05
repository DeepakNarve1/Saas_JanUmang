"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { ContentHeader } from "@app/components";
import { Skeleton } from "@app/components/ui/skeleton";
import PhoneDirectoryForm from "./PhoneDirectoryForm";

interface IDropdownOption {
  _id: string;
  name: string;
}

const EditPhoneDirectory = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [initialValues, setInitialValues] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [departments, setDepartments] = useState<IDropdownOption[]>([]);
  const [districts, setDistricts] = useState<IDropdownOption[]>([]);
  const [blocks, setBlocks] = useState<IDropdownOption[]>([]);
  const [parties, setParties] = useState<IDropdownOption[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [phoneDirectoryRes, deptsRes, distsRes, blocksRes, partiesRes] =
          await Promise.all([
            axios.get(`/phone-directory/${id}`),
            axios.get("/departments", { params: { limit: -1 } }),
            axios.get("/districts", { params: { limit: -1 } }),
            axios.get("/blocks", { params: { limit: -1 } }),
            axios.get("/party", { params: { limit: -1 } }),
          ]);

        const data = phoneDirectoryRes.data.data;
        if (data) {
          setInitialValues({
            name: data.name,
            post: data.post || "",
            department: data.department?._id || data.department || "",
            district: data.district?._id || data.district || "",
            block: data.block?._id || data.block || "",
            party: data.party?._id || data.party || "",
            number: data.number,
            alternateNumber: data.alternateNumber || "",
            email: data.email || "",
            remark: data.remark || "",
            status: data.status,
          });
        }

        setDepartments(deptsRes.data.data);
        setDistricts(distsRes.data.data);
        setBlocks(blocksRes.data.data);
        setParties(partiesRes.data.data);
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(
          err.response?.data?.message || "Failed to load Phone Directory data"
        );
        router.push("/phone-directory");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, router]);

  const handleSubmit = async (values: any) => {
    try {
      setSaving(true);
      await axios.put(`/phone-directory/${id}`, values);
      toast.success("Phone Directory entry updated successfully");
      router.push("/phone-directory");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "Failed to update Phone Directory entry"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <ContentHeader title="Edit Phone Directory Entry" />
        <div className="p-6">
          <Skeleton className="h-[600px] w-full rounded-xl" />
        </div>
      </>
    );
  }

  if (!initialValues) return null;

  return (
    <>
      <ContentHeader title="Edit Phone Directory Entry" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Edit Phone Directory Entry
              </h2>
            </div>
            <div className="p-6 max-w-4xl">
              <PhoneDirectoryForm
                initialValues={initialValues}
                onSubmit={handleSubmit}
                loading={saving}
                departments={departments}
                districts={districts}
                blocks={blocks}
                parties={parties}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default EditPhoneDirectory;
