import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { handleError } from "@app/utils/errorHandler";
import { ContentHeader } from "@app/components";
import { Button } from "@app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@app/components/ui/card";
import { Skeleton } from "@app/components/ui/skeleton";
import { ArrowLeft, Edit } from "lucide-react";
import { ViewPageActions } from "@app/components/ViewPageActions";
import { IParliament } from "@app/types/parliament";

const ViewParliament = () => {
  const { id } = useParams();
  const router = useRouter();
  const [parliament, setParliament] = useState<IParliament | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchParliamentDetails();
  }, [id]);

  const fetchParliamentDetails = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/parliaments/${id}`);
      setParliament(data.data);
    } catch (error: unknown) {
      handleError(error, "Failed to fetch parliament details");
      router.push("/parliaments");
    } finally {
      setLoading(false);
    }
  };

  /* Define export data */
  const getExportData = () => {
    if (!parliament) return {};
    return {
      "Parliament Name": parliament.name,
      Division: (parliament.division as { name?: string })?.name || "",
      "Total Assemblies": parliament.assemblies?.length || 0,
      Assemblies:
        parliament.assemblies
          ?.map((a: { name: string }) => a.name)
          .join(", ") || "",
      "Created At": parliament.createdAt,
    };
  };

  if (loading) {
    //...
  }

  if (!parliament) return null;

  return (
    <>
      <ContentHeader title="Parliament Details" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/parliaments")}
              className="group bg-white dark:bg-[#202123] dark:border-gray-700 dark:text-gray-300 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to List
            </Button>

            <ViewPageActions
              getExportData={getExportData}
              fileName={`Parliament_${parliament.name}`}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Info */}
            <Card className="dark:bg-card dark:border-gray-800 shadow-lg border border-gray-100 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  Basic Information
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push(`/parliaments/${id}/edit`)}
                  className="hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 h-9 w-9"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                      Name
                    </p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      {parliament.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                      Division
                    </label>
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      {(parliament.division as { name?: string })?.name ||
                        "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assemblies */}
            <Card className="dark:bg-card dark:border-gray-800 shadow-lg border border-gray-100 overflow-hidden">
              <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  Associated Assemblies
                </CardTitle>
              </CardHeader>
              <CardContent>
                {parliament.assemblies && parliament.assemblies.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {parliament.assemblies.map((assembly) => (
                      <div
                        key={assembly._id}
                        className="bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg border border-gray-100 dark:border-gray-800 flex items-center justify-between group hover:border-[#368F8B] dark:hover:border-[#368F8B] transition-all"
                      >
                        <span className="font-medium text-gray-700 dark:text-gray-200">
                          {assembly.name}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 italic">
                    No assemblies found for this parliament
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
};

export default ViewParliament;
