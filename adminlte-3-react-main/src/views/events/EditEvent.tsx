"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { handleError } from "@app/utils/errorHandler";
import { ContentHeader } from "@app/components";
import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import EventForm from "./EventForm";
import { IEventFormValues, eventInitialValues } from "./event.schema";

const EditEvent = () => {
  const router = useRouter();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialValues, setInitialValues] =
    useState<IEventFormValues>(eventInitialValues);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await axios.get(`/events/${id}`);

        const eventData = data.data;
        // Format dates for input fields
        if (eventData.receivingDate)
          eventData.receivingDate = eventData.receivingDate.split("T")[0];
        if (eventData.programDate)
          eventData.programDate = eventData.programDate.split("T")[0];

        setInitialValues(eventData);
      } catch (error: unknown) {
        handleError(error, "Failed to fetch event details");
        router.push("/events");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id, router]);

  const handleSubmit = async (values: IEventFormValues) => {
    try {
      setIsSubmitting(true);
      await axios.put(`/events/${id}`, values);
      toast.success("Event updated successfully");
      router.push("/events");
    } catch (error: unknown) {
      handleError(error, "Failed to update event");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.EDIT_EVENTS]}>
      <ContentHeader title="Edit Event" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <EventForm
              onSubmit={handleSubmit}
              loading={isSubmitting}
              initialValues={initialValues}
            />
          </div>
        </div>
      </section>
    </RouteGuard>
  );
};

export default EditEvent;
