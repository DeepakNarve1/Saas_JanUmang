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
import { IBooth } from "@app/types/booth";

const ViewBooth = () => {
  const { id } = useParams();
  const router = useRouter();
  const [booth, setBooth] = useState<IBooth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchBoothDetails();
  }, [id]);

  const fetchBoothDetails = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/booths/${id}`);
      setBooth(data.data);
    } catch (error: unknown) {
      handleError(error, "Failed to fetch booth details");
      router.push("/booths");
    } finally {
      setLoading(false);
    }
  };

  const getExportData = () => {
    if (!booth) return {};
    return {
      Name: booth.name,
      Code: booth.code || "",
      Block: (booth.block as { name?: string })?.name || "",
      "Created At": booth.createdAt,
      "Updated At": booth.updatedAt,
    };
  };

  if (loading) {
    // ... (keep loading state)
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4 dark:bg-[#1a1c1e]">
        <div className="w-12 h-12 border-4 border-[#368F8B] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">
          Loading booth details...
        </p>
      </div>
    );
  }

  if (!booth) return null;

  return (
    <>
      <ContentHeader title="Booth Details" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/booths")}
              className="group bg-white dark:bg-[#202123] dark:border-gray-700 dark:text-gray-300 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to List
            </Button>

            <ViewPageActions
              getExportData={getExportData}
              fileName={`Booth_${booth.code || booth.name}`}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Info */}
            <Card className="dark:bg-card dark:border-gray-800 shadow-xl border border-gray-100 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  Booth Information
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push(`/booths/${id}/edit`)}
                  className="hover:bg-[#368F8B]/20 text-[#368F8B] h-9 w-9 rounded-lg"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="p-4 bg-gray-50/50 dark:bg-gray-800/20 rounded-lg border border-gray-100 dark:border-gray-800/50">
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">
                      Booth Name
                    </p>
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                      {booth.name}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50/50 dark:bg-gray-800/20 rounded-lg border border-gray-100 dark:border-gray-800/50">
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">
                      Booth Code
                    </p>
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                      {booth.code || "N/A"}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50/50 dark:bg-gray-800/20 rounded-lg border border-gray-100 dark:border-gray-800/50">
                    <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">
                      Associated Block
                    </label>
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                      {(booth.block as { name?: string })?.name || "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
};

export default ViewBooth;
