"use client";

import { useFormik } from "formik";
import { useRouter } from "next/navigation";
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
import { Loader2 } from "lucide-react";
import {
  eventSchema,
  eventInitialValues,
  IEventFormValues,
} from "./event.schema";

interface EventFormProps {
  initialValues?: IEventFormValues;
  onSubmit: (values: IEventFormValues) => void;
  loading?: boolean;
}

const EventForm = ({
  initialValues = eventInitialValues,
  onSubmit,
  loading = false,
}: EventFormProps) => {
  const router = useRouter();

  const formik = useFormik<IEventFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: eventSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Unique ID */}
        <div className="space-y-2">
          <Label htmlFor="uniqueId">
            Unique ID{" "}
            <span className="text-gray-400 text-xs">
              (Auto-generated if left empty)
            </span>
          </Label>
          <Input
            id="uniqueId"
            name="uniqueId"
            value={formik.values.uniqueId}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Leave empty for auto-generation (e.g. EVT/1)"
            className={
              formik.touched.uniqueId && formik.errors.uniqueId
                ? "border-red-500"
                : ""
            }
          />
          {formik.touched.uniqueId && formik.errors.uniqueId && (
            <p className="text-red-500 text-sm">{formik.errors.uniqueId}</p>
          )}
        </div>

        {/* District */}
        <div className="space-y-2">
          <Label htmlFor="district">
            District <span className="text-red-500">*</span>
          </Label>
          <Select
            onValueChange={(val) => formik.setFieldValue("district", val)}
            value={formik.values.district}
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
            <SelectContent>
              {[
                "Indore",
                "Bhopal",
                "Jabalpur",
                "Gwalior",
                "Ujjain",
                "Dewas",
                "Satna",
                "Sagar",
                "Ratlam",
                "Rewa",
                "Burhanpur",
                "Dhar",
                "Katni",
                "Raisen",
              ].map((dist) => (
                <SelectItem key={dist} value={dist}>
                  {dist}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formik.touched.district && formik.errors.district && (
            <p className="text-red-500 text-sm">{formik.errors.district}</p>
          )}
        </div>

        {/* Year */}
        <div className="space-y-2">
          <Label htmlFor="year">
            Year <span className="text-red-500">*</span>
          </Label>
          <Select
            onValueChange={(val) => formik.setFieldValue("year", val)}
            value={formik.values.year}
          >
            <SelectTrigger
              className={
                formik.touched.year && formik.errors.year
                  ? "border-red-500"
                  : ""
              }
            >
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {["2023", "2024", "2025", "2026"].map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formik.touched.year && formik.errors.year && (
            <p className="text-red-500 text-sm">{formik.errors.year}</p>
          )}
        </div>

        {/* Month */}
        <div className="space-y-2">
          <Label htmlFor="month">
            Month <span className="text-red-500">*</span>
          </Label>
          <Select
            onValueChange={(val) => formik.setFieldValue("month", val)}
            value={formik.values.month}
          >
            <SelectTrigger
              className={
                formik.touched.month && formik.errors.month
                  ? "border-red-500"
                  : ""
              }
            >
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              {[
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ].map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formik.touched.month && formik.errors.month && (
            <p className="text-red-500 text-sm">{formik.errors.month}</p>
          )}
        </div>

        {/* Receiving Date */}
        <div className="space-y-2">
          <Label htmlFor="receivingDate">
            Receiving Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="receivingDate"
            type="date"
            name="receivingDate"
            value={formik.values.receivingDate}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={
              formik.touched.receivingDate && formik.errors.receivingDate
                ? "border-red-500"
                : ""
            }
          />
          {formik.touched.receivingDate && formik.errors.receivingDate && (
            <p className="text-red-500 text-sm">
              {formik.errors.receivingDate}
            </p>
          )}
        </div>

        {/* Program Date */}
        <div className="space-y-2">
          <Label htmlFor="programDate">
            Program Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="programDate"
            type="date"
            name="programDate"
            value={formik.values.programDate}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={
              formik.touched.programDate && formik.errors.programDate
                ? "border-red-500"
                : ""
            }
          />
          {formik.touched.programDate && formik.errors.programDate && (
            <p className="text-red-500 text-sm">{formik.errors.programDate}</p>
          )}
        </div>

        {/* Time */}
        <div className="space-y-2">
          <Label htmlFor="time">
            Time <span className="text-red-500">*</span>
          </Label>
          <Input
            id="time"
            type="time"
            name="time"
            value={formik.values.time}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={
              formik.touched.time && formik.errors.time ? "border-red-500" : ""
            }
          />
          {formik.touched.time && formik.errors.time && (
            <p className="text-red-500 text-sm">{formik.errors.time}</p>
          )}
        </div>

        {/* Event Type */}
        <div className="space-y-2">
          <Label htmlFor="eventType">
            Event Type <span className="text-red-500">*</span>
          </Label>
          <Select
            onValueChange={(val) => formik.setFieldValue("eventType", val)}
            value={formik.values.eventType}
          >
            <SelectTrigger
              className={
                formik.touched.eventType && formik.errors.eventType
                  ? "border-red-500"
                  : ""
              }
            >
              <SelectValue placeholder="Select Event Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Social Events">
                Social Events (विवाह/उत्सव)
              </SelectItem>
              <SelectItem value="Religious Events">
                Religious Events (धर्मसभा/कथा)
              </SelectItem>
              <SelectItem value="Political Rally">Political Rally</SelectItem>
              <SelectItem value="Meeting">Meeting</SelectItem>
              <SelectItem value="Inauguration">Inauguration</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          {formik.touched.eventType && formik.errors.eventType && (
            <p className="text-red-500 text-sm">{formik.errors.eventType}</p>
          )}
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <Label htmlFor="priority">
            Priority <span className="text-red-500">*</span>
          </Label>
          <Select
            onValueChange={(val) => formik.setFieldValue("priority", val)}
            value={formik.values.priority}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
          {formik.touched.priority && formik.errors.priority && (
            <p className="text-red-500 text-sm">{formik.errors.priority}</p>
          )}
        </div>

        {/* Venue City */}
        <div className="space-y-2">
          <Label htmlFor="venueCity">
            Venue City <span className="text-red-500">*</span>
          </Label>
          <Input id="venueCity" {...formik.getFieldProps("venueCity")} />
          {formik.touched.venueCity && formik.errors.venueCity && (
            <p className="text-red-500 text-sm">{formik.errors.venueCity}</p>
          )}
        </div>

        {/* Reference Person */}
        <div className="space-y-2">
          <Label htmlFor="referencePerson">
            Reference Person <span className="text-red-500">*</span>
          </Label>
          <Input
            id="referencePerson"
            {...formik.getFieldProps("referencePerson")}
          />
          {formik.touched.referencePerson && formik.errors.referencePerson && (
            <p className="text-red-500 text-sm">
              {formik.errors.referencePerson}
            </p>
          )}
        </div>

        {/* Contact Number */}
        <div className="space-y-2">
          <Label htmlFor="contactNumber">
            Contact Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="contactNumber"
            {...formik.getFieldProps("contactNumber")}
          />
          {formik.touched.contactNumber && formik.errors.contactNumber && (
            <p className="text-red-500 text-sm">
              {formik.errors.contactNumber}
            </p>
          )}
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address">
            Address <span className="text-red-500">*</span>
          </Label>
          <Input id="address" {...formik.getFieldProps("address")} />
          {formik.touched.address && formik.errors.address && (
            <p className="text-red-500 text-sm">{formik.errors.address}</p>
          )}
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Name <span className="text-red-500">*</span>
          </Label>
          <Input id="name" {...formik.getFieldProps("name")} />
          {formik.touched.name && formik.errors.name && (
            <p className="text-red-500 text-sm">{formik.errors.name}</p>
          )}
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">
            Location <span className="text-red-500">*</span>
          </Label>
          <Input id="location" {...formik.getFieldProps("location")} />
          {formik.touched.location && formik.errors.location && (
            <p className="text-red-500 text-sm">{formik.errors.location}</p>
          )}
        </div>

        {/* Probability */}
        <div className="space-y-2">
          <Label htmlFor="probability">
            Probability <span className="text-red-500">*</span>
          </Label>
          <Input id="probability" {...formik.getFieldProps("probability")} />
          {formik.touched.probability && formik.errors.probability && (
            <p className="text-red-500 text-sm">{formik.errors.probability}</p>
          )}
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <Label htmlFor="duration">
            Duration <span className="text-red-500">*</span>
          </Label>
          <Input id="duration" {...formik.getFieldProps("duration")} />
          {formik.touched.duration && formik.errors.duration && (
            <p className="text-red-500 text-sm">{formik.errors.duration}</p>
          )}
        </div>

        {/* Attended */}
        <div className="space-y-2">
          <Label htmlFor="attended">Attended</Label>
          <Select
            onValueChange={(val) => formik.setFieldValue("attended", val)}
            value={formik.values.attended}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Yes">Yes</SelectItem>
              <SelectItem value="No">No</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Press Conference */}
        <div className="space-y-2">
          <Label htmlFor="pressConference">Press Conference</Label>
          <Select
            onValueChange={(val) =>
              formik.setFieldValue("pressConference", val)
            }
            value={formik.values.pressConference}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Yes">Yes</SelectItem>
              <SelectItem value="No">No</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Dispatch Date */}
        <div className="space-y-2">
          <Label htmlFor="dispatchDate">Dispatch Date</Label>
          <Input
            id="dispatchDate"
            type="date"
            {...formik.getFieldProps("dispatchDate")}
          />
        </div>

        {/* Dispatch Number */}
        <div className="space-y-2">
          <Label htmlFor="dispatchNumber">Dispatch Number</Label>
          <Input
            id="dispatchNumber"
            {...formik.getFieldProps("dispatchNumber")}
          />
        </div>

        {/* Added By */}
        <div className="space-y-2">
          <Label htmlFor="addedBy">Added By</Label>
          <Input id="addedBy" {...formik.getFieldProps("addedBy")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="eventDetails">
          Event Details <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="eventDetails"
          name="eventDetails"
          placeholder="Enter event details here..."
          className={`h-24 ${formik.touched.eventDetails && formik.errors.eventDetails ? "border-red-500" : ""}`}
          value={formik.values.eventDetails}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.eventDetails && formik.errors.eventDetails && (
          <p className="text-red-500 text-sm">{formik.errors.eventDetails}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="remarks">Remarks</Label>
        <Textarea
          id="remarks"
          name="remarks"
          placeholder="Enter remarks..."
          className="h-24"
          value={formik.values.remarks}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.remarks && formik.errors.remarks && (
          <p className="text-red-500 text-sm">{formik.errors.remarks}</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-[#00563B] hover:bg-[#368F8B] min-w-[120px]"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Event"
          )}
        </Button>
      </div>
    </form>
  );
};

export default EventForm;
