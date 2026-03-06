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
import { IAssembly } from "@app/types/assembly";

const ViewAssembly = () => {
  const { id } = useParams();
  const router = useRouter();
  const [assembly, setAssembly] = useState<IAssembly | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchAssemblyDetails();
  }, [id]);

  const fetchAssemblyDetails = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/assemblies/${id}`);
      setAssembly(data.data);
    } catch (error: unknown) {
      handleError(error, "Failed to fetch assembly details");
      router.push("/assemblies");
    } finally {
      setLoading(false);
    }
  };

  /* Define export data */
  const getExportData = () => {
    if (!assembly) return {};
    return {
      "Assembly Name": assembly.name,
      Parliament: (assembly.parliament as { name?: string })?.name || "",
      "Total Blocks": assembly.blocks?.length || 0,
      Blocks:
        assembly.blocks?.map((b: { name: string }) => b.name).join(", ") || "",
      "Created At": assembly.createdAt,
    };
  };

  if (loading) {
    // ... (keep loading state)
    return (
      <div className="container-fluid px-4 py-6">
        <Skeleton className="h-10 w-64 mb-6 dark:bg-gray-800" />
        <Card className="dark:bg-card dark:border-gray-800">
          <CardHeader>
            <Skeleton className="h-6 w-32 dark:bg-gray-800" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full dark:bg-gray-800" />
            <Skeleton className="h-4 w-full dark:bg-gray-800" />
            <Skeleton className="h-4 w-3/4 dark:bg-gray-800" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!assembly) return null;

  return (
    <>
      <ContentHeader title="Assembly Details" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/assemblies")}
              className="group bg-white dark:bg-[#202123] dark:border-gray-700 dark:text-gray-300 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to List
            </Button>

            <ViewPageActions
              getExportData={getExportData}
              fileName={`Assembly_${assembly.name}`}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Info */}
            <Card className="dark:bg-card dark:border-gray-800 shadow-xl border border-gray-100 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  Basic Information
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push(`/assemblies/${id}/edit`)}
                  className="hover:bg-[#368F8B]/20 text-[#368F8B] h-9 w-9 rounded-lg"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-4 bg-gray-50/50 dark:bg-gray-800/20 rounded-lg border border-gray-100 dark:border-gray-800/50">
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">
                      Assembly Name
                    </p>
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                      {assembly.name}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50/50 dark:bg-gray-800/20 rounded-lg border border-gray-100 dark:border-gray-800/50">
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">
                      Parliament
                    </p>
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                      {(assembly.parliament as { name?: string })?.name ||
                        "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Blocks */}
            <Card className="dark:bg-card dark:border-gray-800 shadow-xl border border-gray-100 overflow-hidden">
              <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  Associated Blocks
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {assembly.blocks && assembly.blocks.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {assembly.blocks.map(
                      (block: { _id: string; name: string }) => (
                        <div
                          key={block._id}
                          className="bg-gray-50/50 dark:bg-gray-800/20 p-4 rounded-xl border border-gray-100 dark:border-gray-800/50 flex items-center justify-between group hover:border-[#368F8B] dark:hover:border-[#368F8B] transition-all"
                        >
                          <span className="font-bold text-gray-700 dark:text-gray-200">
                            {block.name}
                          </span>
                          <div className="w-2 h-2 rounded-full bg-[#368F8B] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-gray-800/10 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 italic">
                    No blocks found for this assembly
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

export default ViewAssembly;
