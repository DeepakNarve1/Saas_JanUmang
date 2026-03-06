"use client";

import { useEffect, useState } from "react";
import axios from "@app/utils/axios";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";
import { handleError } from "@app/utils/errorHandler";
import { ContentHeader } from "@app/components";
import CallForm from "./CallForm";
import { Loader2 } from "lucide-react";

const EditCall = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [initialValues, setInitialValues] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/call-management/${id}`);
        const data = res.data.data;

        // Format dates for input
        const formatDate = (dateString: string) => {
          if (!dateString) return "";
          const date = new Date(dateString);
          date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
          return date.toISOString().slice(0, 16);
        };

        setInitialValues({
          date: formatDate(data.date), // Assuming backend returns field 'date' specifically for call date
          category: data.category || "",
          name: data.name || "",
          mobile: data.mobile || "",
          subject: data.subject || "",
          assignDate: formatDate(data.assignDate),
          address: data.address || "",
          description: data.description || "",
          remark: data.remark || "",
        });
      } catch (error: unknown) {
        handleError(error, "Failed to fetch call details");
        router.push("/call-management");
      } finally {
        setIsFetching(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, router]);

  const handleSubmit = async (values: any) => {
    try {
      setIsLoading(true);

      await axios.put(`/call-management/${id}`, values);
      toast.success("Call record updated successfully");
      router.push("/call-management");
    } catch (error: unknown) {
      handleError(error, "Failed to update call record");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#00563B]" />
      </div>
    );
  }

  return (
    <>
      <ContentHeader title="Edit Call" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-6 overflow-hidden">
            <CallForm
              initialValues={initialValues}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default EditCall;
