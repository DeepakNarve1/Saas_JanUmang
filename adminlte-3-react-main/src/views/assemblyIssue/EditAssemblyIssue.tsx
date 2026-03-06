"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "@app/utils/axios";
import { toast } from "react-toastify";
import { handleError } from "@app/utils/errorHandler";
import { ContentHeader } from "@app/components";
import { RouteGuard } from '@app/components/RouteGuard';
import { PERMISSIONS } from "@app/config/permissions";
import { Skeleton } from "@app/components/ui/skeleton";
import AssemblyIssueForm from "./AssemblyIssueForm";
import {
  IAssemblyIssueFormValues,
  assemblyIssueInitialValues,
} from "./assemblyIssue.schema";

interface EditAssemblyIssueProps {
  issueType?: string;
  title?: string;
  basePath?: string;
}

const EditAssemblyIssue = ({
  issueType = "assembly-issue",
  title = "Edit Assembly Issue",
  basePath = "/assembly-issue",
}: EditAssemblyIssueProps) => {
  return (
    <RouteGuard requiredPermissions={[PERMISSIONS.EDIT_ASSEMBLY_ISSUES]}>
      <EditAssemblyIssueContent
        issueType={issueType}
        title={title}
        basePath={basePath}
      />
    </RouteGuard>
  );
};

const EditAssemblyIssueContent = ({
  issueType,
  title,
  basePath,
}: {
  issueType: string;
  title: string;
  basePath: string;
}) => {
  const router = useRouter();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState<IAssemblyIssueFormValues>(
    assemblyIssueInitialValues,
  );
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        setPageLoading(true);
        const { data } = await axios.get(`/assembly-issues/${id}`);
        if (data && data.data) {
          const resData = data.data;
          setInitialValues({
            uniqueId: resData.uniqueId || "",
            year: resData.year || "",
            month: resData.month || "",
            date: resData.date || "",
            district: resData.district || "",
            assembly: resData.assembly || "",
            acMpNo: resData.acMpNo || "",
            block:
              (typeof resData.block === "object"
                ? resData.block._id
                : resData.block) || "",
            recommendedLetterNo: resData.recommendedLetterNo || "",
            sectorName: resData.sectorName || "",
            microSectorNo: resData.microSectorNo || "",
            microSectorName: resData.microSectorName || "",
            boothName: resData.boothName || "",
            boothNo: resData.boothNo || "",
            panchayatName: resData.panchayatName || resData.gramPanchayat || "",
            village: resData.village || "",
            majraFaliya: resData.majraFaliya || resData.faliya || "",
            workProblem: resData.workProblem || "",
            office: resData.office || "",
            approximateCost: resData.approximateCost || 0,
            department: resData.department || "",
            priority: resData.priority || "",
            tsNoDate: resData.tsNoDate || "",
            asNoDate: resData.asNoDate || "",
            typeOfWork: resData.typeOfWork || "",
            subWorkType: resData.subWorkType || "",
            middleMen: resData.middleMen || "",
            middleManContact: resData.middleManContact || "",
            beneficiaryName: resData.beneficiaryName || "",
            beneficiaryContact: resData.beneficiaryContact || "",
            po: resData.po || "",
            avedanFile: resData.avedanFile || "",
            avedanFileName: resData.avedanFileName || "",
            accountDetails: resData.accountDetails || "",
            adharCardNumber: resData.adharCardNumber || "",
            ifscNumber: resData.ifscNumber || "",
            documentFile: resData.documentFile || "",
            documentFileName: resData.documentFileName || "",
            remarkGoshana: resData.remarkGoshana || "",
            remarkTipUsd: resData.remarkTipUsd || "",
            latLng: resData.latLng || "",
            registrationDate: resData.registrationDate || "",
            totalMembers: resData.totalMembers || 0,
          });
        }
      } catch (error: unknown) {
        handleError(error, "Failed to load assembly issue details");
        router.push(basePath);
      } finally {
        setPageLoading(false);
      }
    };

    if (id) {
      fetchIssue();
    }
  }, [id, router]);

  const handleSubmit = async (values: IAssemblyIssueFormValues) => {
    try {
      setLoading(true);
      await axios.put(`/assembly-issues/${id}`, {
        ...values,
        totalMembers: Number(values.totalMembers),
      });

      toast.success(`${title} updated successfully!`);
      router.push(basePath);
    } catch (error: unknown) {
      handleError(error, "Failed to update issue");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <>
        <ContentHeader title={title} />
        <div className="p-6">
          <Skeleton className="h-[600px] w-full rounded-xl" />
        </div>
      </>
    );
  }

  return (
    <>
      <ContentHeader title={title} />
      <section className="content">
        <div className="container-fluid px-4">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-6 max-w-5xl mx-auto overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                Edit Jansunwai Details
              </h2>
            </div>
            <AssemblyIssueForm
              initialValues={initialValues}
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

export default EditAssemblyIssue;
