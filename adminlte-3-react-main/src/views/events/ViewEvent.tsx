"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { handleError } from "@app/utils/errorHandler";
import { ContentHeader } from "@app/components";
import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import { Button } from "@app/components/ui/button";
import { Label } from "@app/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@app/components/ui/card";
import { Badge } from "@app/components/ui/badge";
import { Calendar, Clock, MapPin, FileText, Info } from "lucide-react";
import { ViewPageActions } from "@app/components/ViewPageActions";

interface IEvent {
  _id: string;
  uniqueId: string;
  district: string;
  year: string;
  month: string;
  receivingDate: string;
  programDate: string;
  time: string;
  eventType: string;
  eventDetails: string;
}

const ViewEvent = () => {
  const router = useRouter();
  const { id } = useParams();
  const [event, setEvent] = useState<IEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await axios.get(`/events/${id}`);
        setEvent(data.data);
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

  if (loading) return <div>Loading...</div>;
  if (!event) return <div>Event not found</div>;

  /* Define export data */
  const getExportData = () => {
    if (!event) return {};
    return {
      "Unique ID": event.uniqueId,
      "Event Type": event.eventType,
      District: event.district,
      Year: event.year,
      Month: event.month,
      "Receiving Date": new Date(event.receivingDate).toLocaleDateString(),
      "Program Date": new Date(event.programDate).toLocaleDateString(),
      Time: event.time,
      "Event Details": event.eventDetails,
    };
  };

  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.VIEW_EVENTS]}>
      <ContentHeader title="View Event" />
      <section className="content">
        <div className="container-fluid px-4">
          <Card className="max-w-4xl mx-auto shadow-lg border border-gray-200 mt-6">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    {event.uniqueId}
                    <Badge className="bg-blue-600 ml-2">
                      {event.eventType}
                    </Badge>
                  </CardTitle>
                  <p className="text-gray-500 mt-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> {event.district}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      Year:{" "}
                      <span className="font-semibold text-gray-700">
                        {event.year}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Month:{" "}
                      <span className="font-semibold text-gray-700">
                        {event.month}
                      </span>
                    </p>
                  </div>
                  <ViewPageActions
                    getExportData={getExportData}
                    fileName={`Event_${event.uniqueId}`}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-500" /> Date & Time
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-500">Receiving Date</Label>
                      <p className="font-medium text-gray-900">
                        {new Date(event.receivingDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Program Date</Label>
                      <p className="font-medium text-gray-900">
                        {new Date(event.programDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Time</Label>
                      <p className="font-medium text-gray-900">{event.time}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                    <Info className="w-5 h-5 text-gray-500" /> Additional Info
                  </h3>
                  {/* Placeholder for future fields or specific logic */}
                  <div>
                    <Label className="text-gray-500">District</Label>
                    <p className="font-medium text-gray-900">
                      {event.district}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-500" /> Event Details
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {event.eventDetails}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <Button variant="outline" onClick={() => router.back()}>
                  Back to List
                </Button>
                <Button
                  className="bg-[#00563B] hover:bg-[#368F8B]"
                  onClick={() => router.push(`/events/${event._id}/edit`)}
                >
                  Edit Event
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </RouteGuard>
  );
};

export default ViewEvent;
