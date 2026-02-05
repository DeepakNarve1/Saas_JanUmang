import { useQuery } from "@tanstack/react-query";
import axios from "@app/utils/axios";

// 1 Hour cache for static hierarchy data
const STALE_TIME_STATIC = 1000 * 60 * 60;
// 15 Mins for more dynamic data
const STALE_TIME_DYNAMIC = 1000 * 60 * 15;

export const useBlocks = () => {
  return useQuery({
    queryKey: ["blocks"],
    queryFn: async () => {
      const { data } = await axios.get("/blocks?limit=-1");
      return data.data || [];
    },
    staleTime: STALE_TIME_STATIC,
  });
};

export const useBooths = (blockId: string) => {
  return useQuery({
    queryKey: ["booths", blockId],
    queryFn: async () => {
      const { data } = await axios.get(`/booths?limit=-1&block=${blockId}`);
      return data.data || [];
    },
    enabled: !!blockId,
    staleTime: STALE_TIME_DYNAMIC,
  });
};

export const usePanchayats = (blockId: string) => {
  return useQuery({
    queryKey: ["panchayats", blockId],
    queryFn: async () => {
      const { data } = await axios.get(`/panchayat?limit=-1&block=${blockId}`);
      return data.data || [];
    },
    enabled: !!blockId,
    staleTime: STALE_TIME_STATIC,
  });
};

export const useVillages = (panchayatId: string) => {
  return useQuery({
    queryKey: ["villages", panchayatId],
    queryFn: async () => {
      const { data } = await axios.get(
        `/villages?limit=-1&panchayat=${panchayatId}`,
      );
      return data.data || [];
    },
    enabled: !!panchayatId,
    staleTime: STALE_TIME_STATIC,
  });
};
