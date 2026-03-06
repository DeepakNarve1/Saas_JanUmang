import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@app/components/ui/button";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import { Textarea } from "@app/components/ui/textarea";
import { Card, CardContent } from "@app/components/ui/card";
import { Loader2, User, Phone, Fingerprint, MapPin, Users } from "lucide-react";
import { HierarchySelector } from "@app/components";

interface IVoterFormValues {
  name: string;
  fatherName: string;
  mobileNumber: string;
  age: string | number;
  cast: string;
  subcast: string;
  fulladdress: string;
  voterId: string;
  state: string;
  division: string;
  district: string;
  parliament: string;
  assembly: string;
  block: string;
  panchayat: string;
  village: string;
  booth: string;
  fallaMarjra: string;
}

interface VoterFormProps {
  initialValues?: IVoterFormValues;
  onSubmit: (values: IVoterFormValues) => void;
  loading?: boolean;
}

const VoterForm = ({
  initialValues = {
    name: "",
    fatherName: "",
    mobileNumber: "",
    age: "",
    cast: "",
    subcast: "",
    fulladdress: "",
    voterId: "",
    state: "",
    division: "",
    district: "",
    parliament: "",
    assembly: "",
    block: "",
    panchayat: "",
    village: "",
    booth: "",
    fallaMarjra: "",
  },
  onSubmit,
  loading = false,
}: VoterFormProps) => {
  const formik = useFormik<IVoterFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string().required("Voter name is required"),
      fatherName: Yup.string().required("Father name is required"),
      mobileNumber: Yup.string()
        .matches(/^[0-9]{10}$/, "Invalid mobile number")
        .required("Mobile number is required"),
      age: Yup.number()
        .min(18, "Voter must be at least 18")
        .required("Age is required"),
      fulladdress: Yup.string().required("Address is required"),
      state: Yup.string().required("State is required"),
      division: Yup.string().required("Division is required"),
      district: Yup.string().required("District is required"),
      parliament: Yup.string().required("Parliament is required"),
      assembly: Yup.string().required("Assembly is required"),
      block: Yup.string().required("Block is required"),
      panchayat: Yup.string().required("Panchayat is required"),
      village: Yup.string().required("Village is required"),
      booth: Yup.string().required("Booth is required"),
    }),
    onSubmit: (values) => {
      onSubmit({ ...values });
    },
  });

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardContent className="p-0 dark:bg-card">
        <form onSubmit={formik.handleSubmit} className="space-y-8">
          {/* Section 1: Geographic Hierarchy */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
              <MapPin className="w-5 h-5 text-[#368F8B]" />
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-tight">
                Location Hierarchy
              </h3>
            </div>
            <HierarchySelector formik={formik} />
          </div>

          {/* Section 2: Personal Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
              <User className="w-5 h-5 text-[#368F8B]" />
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-tight">
                Personal Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-gray-700 dark:text-gray-300 font-medium"
                >
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter voter name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 ${
                    formik.touched.name && formik.errors.name
                      ? "border-red-500"
                      : ""
                  }`}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="fatherName"
                  className="text-gray-700 dark:text-gray-300 font-medium"
                >
                  Father&apos;s Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fatherName"
                  name="fatherName"
                  placeholder="Enter father's name"
                  value={formik.values.fatherName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 ${
                    formik.touched.fatherName && formik.errors.fatherName
                      ? "border-red-500"
                      : ""
                  }`}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="mobileNumber"
                  className="text-gray-700 dark:text-gray-300 font-medium"
                >
                  Mobile Number <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="mobileNumber"
                    name="mobileNumber"
                    type="text"
                    placeholder="10-digit number"
                    maxLength={10}
                    value={formik.values.mobileNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 10) {
                        formik.setFieldValue("mobileNumber", value);
                        // Also update formik.handleChange(e) not needed if we setFieldValue directly,
                        // but Formik might need the event for touched state.
                        // Actually setFieldValue is enough for value.
                        // To properly trigger validation and touched, strictly we might want to also call handleBlur.
                        // But setFieldValue commonly works.
                      }
                    }}
                    onBlur={formik.handleBlur}
                    className={`pl-9 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 ${formik.touched.mobileNumber && formik.errors.mobileNumber ? "border-red-500" : ""}`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="age"
                  className="text-gray-700 dark:text-gray-300 font-medium"
                >
                  Age <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  placeholder="Minimum 18"
                  value={formik.values.age}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 ${
                    formik.touched.age && formik.errors.age
                      ? "border-red-500"
                      : ""
                  }`}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="voterId"
                  className="text-gray-700 dark:text-gray-300 font-medium"
                >
                  Voter ID (Optional)
                </Label>
                <div className="relative">
                  <Fingerprint className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="voterId"
                    name="voterId"
                    placeholder="ABC1234567"
                    value={formik.values.voterId}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="pl-9 dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="cast"
                  className="text-gray-700 dark:text-gray-300 font-medium"
                >
                  Caste
                </Label>
                <Input
                  id="cast"
                  name="cast"
                  placeholder="Enter caste"
                  value={formik.values.cast}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="subcast"
                  className="text-gray-700 dark:text-gray-300 font-medium"
                >
                  Sub-Caste
                </Label>
                <Input
                  id="subcast"
                  name="subcast"
                  placeholder="Enter sub-caste"
                  value={formik.values.subcast}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="fallaMarjra"
                  className="text-gray-700 dark:text-gray-300 font-medium"
                >
                  Faliya / Marjra
                </Label>
                <Input
                  id="fallaMarjra"
                  name="fallaMarjra"
                  placeholder="Enter locality"
                  value={formik.values.fallaMarjra}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="fulladdress"
                className="text-gray-700 dark:text-gray-300 font-medium"
              >
                Full Address <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="fulladdress"
                name="fulladdress"
                placeholder="Enter complete residential address"
                value={formik.values.fulladdress}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-200 ${
                  formik.touched.fulladdress && formik.errors.fulladdress
                    ? "border-red-500"
                    : ""
                }`}
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              disabled={loading}
              className="h-11 px-8 dark:bg-[#202123] dark:border-gray-700 dark:text-gray-300 rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#368F8B] hover:bg-[#2d7a76] h-11 px-10 font-bold text-white rounded-lg shadow-lg shadow-[#368F8B]/20 transition-all"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Save Voter Record"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default VoterForm;
