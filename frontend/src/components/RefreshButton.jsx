import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";

export const RefreshButton = ({ className = "", iconOnly = false }) => {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] !== "auth",
      });
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleRefresh}
      disabled={refreshing}
      aria-label="Atualizar dados"
      className={`${className || "flex"} shrink-0 items-center gap-2 rounded-sm border border-[#403A46] bg-[#19171E] ${iconOnly ? "h-9 w-9 justify-center p-0" : "py-2 px-3"} text-xs font-semibold text-[#BEB5BF] transition hover:bg-[#24212A] hover:text-[#F0E8DC] disabled:cursor-wait disabled:opacity-60`}
    >
      <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
      {iconOnly ? <span className="sr-only">Atualizar</span> : "Atualizar"}
    </button>
  );
};
