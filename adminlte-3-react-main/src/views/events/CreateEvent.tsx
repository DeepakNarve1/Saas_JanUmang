"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { handleError } from "@app/utils/errorHandler";
import { ContentHeader } from "@app/components";
import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import EventForm from "./EventForm";
import { IEventFormValues } from "./event.schema";

const CreateEvent = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: IEventFormValues) => {
    try {
      setIsSubmitting(true);
      const response = await axios.post("/events", values);
      toast.success("Event created successfully");
      router.push("/events");
    } catch (error: unknown) {
      handleError(error, "Failed to create event");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.CREATE_EVENTS]}>
      <ContentHeader title="Create Event" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <EventForm onSubmit={handleSubmit} loading={isSubmitting} />
          </div>
        </div>
      </section>
    </RouteGuard>
  );
};

export default CreateEvent;
