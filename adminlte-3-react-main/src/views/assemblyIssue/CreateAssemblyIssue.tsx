"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { handleError } from "@app/utils/errorHandler";
import { ContentHeader } from "@app/components";
import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import AssemblyIssueForm from "./AssemblyIssueForm";
import { IAssemblyIssueFormValues } from "./assemblyIssue.schema";

interface CreateAssemblyIssueProps {
  issueType?: string;
  title?: string;
  basePath?: string;
}

const CreateAssemblyIssue = ({
  issueType = "assembly-issue",
  title = "Add New Assembly Issue",
  basePath = "/assembly-issue",
}: CreateAssemblyIssueProps) => {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.CREATE_ASSEMBLY_ISSUES]}>
      <CreateAssemblyIssueContent
        issueType={issueType}
        title={title}
        basePath={basePath}
      />
    </RouteGuard>
  );
};

const CreateAssemblyIssueContent = ({
  issueType,
  title,
  basePath,
}: {
  issueType: string;
  title: string;
  basePath: string;
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: IAssemblyIssueFormValues) => {
    try {
      setLoading(true);
      const payload = {
        ...values,
        totalMembers: Number(values.totalMembers),
        issueType,
      };

      await axios.post("/assembly-issues", payload);

      toast.success(`${title} created successfully!`);
      router.push(basePath);
    } catch (error: unknown) {
      handleError(error, "Failed to create issue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ContentHeader title={title} />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 max-w-5xl mx-auto overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                Enter Jansunwai Details
              </h2>
            </div>
            <AssemblyIssueForm
              onSubmit={handleSubmit}
              loading={loading}
              basePath={basePath}
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default CreateAssemblyIssue;
