import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
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

interface IBlockDetails {
  _id: string;
  name: string;
  assembly: {
    _id: string;
    name: string;
  };
  booths: {
    _id: string;
    name: string;
    code?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

const ViewBlock = () => {
  const { id } = useParams();
  const router = useRouter();
  const [block, setBlock] = useState<IBlockDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchBlockDetails();
  }, [id]);

  const fetchBlockDetails = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/blocks/${id}`);
      setBlock(data.data);
    } catch (error: unknown) {
      toast.error("Failed to fetch block details");
      router.push("/blocks");
    } finally {
      setLoading(false);
    }
  };

  const getExportData = () => {
    if (!block) return {};
    const booths =
      block.booths?.map((b) => `${b.name} (${b.code || ""})`).join(", ") || "";
    return {
      "Block Name": block.name,
      Assembly: block.assembly?.name || "",
      "Total Booths": block.booths?.length || 0,
      Booths: booths,
      "Created At": block.createdAt,
    };
  };

  if (loading) {
    // ... (keep loading state)
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4 dark:bg-[#1a1c1e]">
        <div className="w-12 h-12 border-4 border-[#368F8B] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">
          Loading block details...
        </p>
      </div>
    );
  }

  if (!block) return null;

  return (
    <>
      <ContentHeader title="Block Details" />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/blocks")}
              className="group bg-white dark:bg-[#202123] dark:border-gray-700 dark:text-gray-300 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to List
            </Button>

            <ViewPageActions
              getExportData={getExportData}
              fileName={`Block_${block.name}`}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Info */}
            <Card className="dark:bg-card dark:border-gray-800 shadow-xl border border-gray-100 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  Block Information
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push(`/blocks/${id}/edit`)}
                  className="hover:bg-[#368F8B]/20 text-[#368F8B] h-9 w-9 rounded-lg"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-4 bg-gray-50/50 dark:bg-gray-800/20 rounded-lg border border-gray-100 dark:border-gray-800/50">
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">
                      Block Name
                    </p>
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                      {block.name}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50/50 dark:bg-gray-800/20 rounded-lg border border-gray-100 dark:border-gray-800/50">
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">
                      Associated Assembly
                    </p>
                    <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                      {block.assembly?.name || "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booths */}
            <Card className="dark:bg-card dark:border-gray-800 shadow-xl border border-gray-100 overflow-hidden">
              <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  Associated Booths
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {block.booths && block.booths.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {block.booths.map((booth) => (
                      <div
                        key={booth._id}
                        className="bg-gray-50/50 dark:bg-gray-800/20 p-4 rounded-xl border border-gray-100 dark:border-gray-800/50 flex items-center justify-between group hover:border-[#368F8B] dark:hover:border-[#368F8B] transition-all"
                      >
                        <span className="font-bold text-gray-700 dark:text-gray-200">
                          {booth.name} {booth.code ? `(${booth.code})` : ""}
                        </span>
                        <div className="w-2 h-2 rounded-full bg-[#368F8B] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-gray-800/10 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 italic">
                    No booths found for this block
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

export default ViewBlock;
