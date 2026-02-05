"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { ContentHeader } from "@app/components";
import PhoneDirectoryForm from "./PhoneDirectoryForm";

interface IDropdownOption {
  _id: string;
  name: string;
}

const CreatePhoneDirectory = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<IDropdownOption[]>([]);
  const [districts, setDistricts] = useState<IDropdownOption[]>([]);
  const [blocks, setBlocks] = useState<IDropdownOption[]>([]);
  const [parties, setParties] = useState<IDropdownOption[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptsRes, distsRes, blocksRes, partiesRes] = await Promise.all([
          axios.get("/departments", { params: { limit: -1 } }),
          axios.get("/districts", { params: { limit: -1 } }),
          axios.get("/blocks", { params: { limit: -1 } }),
          axios.get("/party", { params: { limit: -1 } }),
        ]);

        setDepartments(deptsRes.data.data);
        setDistricts(distsRes.data.data);
        setBlocks(blocksRes.data.data);
        setParties(partiesRes.data.data);
      } catch (error: unknown) {
        console.error("Error fetching dropdown data", error);
        toast.error("Failed to load dropdown options");
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      await axios.post("/phone-directory", values);
      toast.success("Phone Directory entry created successfully");
      router.push("/phone-directory");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "Failed to create Phone Directory entry"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ContentHeader title="Create Phone Directory Entry" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Add New Phone Directory Entry
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Create a new Phone Directory record.
              </p>
            </div>
            <div className="p-6 max-w-4xl">
              <PhoneDirectoryForm
                onSubmit={handleSubmit}
                loading={loading}
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

export default CreatePhoneDirectory;
