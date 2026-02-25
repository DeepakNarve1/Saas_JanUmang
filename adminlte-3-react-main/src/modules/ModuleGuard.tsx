import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useModuleAccess } from "@app/hooks/useModuleAccess";
import { Loading } from "@app/components/Loading";

interface ModuleGuardProps {
  moduleId: string; // Use strict type if possible
  children: React.ReactNode;
  fallbackUrl?: string;
}

const ModuleGuard: React.FC<ModuleGuardProps> = ({
  moduleId,
  children,
  fallbackUrl = "/dashboard",
}) => {
  const router = useRouter();
  const { checkModuleAccess } = useModuleAccess();
  const hasAccess = checkModuleAccess(moduleId);

  // Need to handle loading state?
  // Assuming auth is already loaded if this component is rendered inside protected layout.

  useEffect(() => {
    if (!hasAccess) {
      router.push(fallbackUrl);
    }
  }, [hasAccess, router, fallbackUrl]);

  if (!hasAccess) {
    return <Loading />; // Or return null
  }

  return <>{children}</>;
};

export default ModuleGuard;
