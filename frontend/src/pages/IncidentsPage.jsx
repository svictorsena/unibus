import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { AlertTriangle } from "lucide-react";
import SubmitButton from "../components/SubmitButton";

export const IncidentsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const canCreate = user?.perfil === "MOTORISTA" || user?.perfil === "ADMIN";

  const [tipo, setTipo] = useState("Atraso");
  const [descricao, setDescricao] = useState("");
  const [veiculoId, setVeiculoId] = useState("");

  const incidentsQuery = useQuery({
    queryKey: ["incidents"],
    queryFn: async () => (await api.get("/ocorrencias")).data,
  });
  const vehiclesQuery = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => (await api.get("/veiculos")).data,
  });
  const createIncidentMutation = useMutation({
    mutationFn: (incident) => api.post("/ocorrencias", incident),
    onSuccess: () => {
      setDescricao("");
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
    },
  });
  const ocorrencias = incidentsQuery.data || [];
  const veiculos = vehiclesQuery.data || [];
  useEffect(() => {
    if (veiculos.length > 0 && !veiculoId) {
      setVeiculoId(String(veiculos[0].id));
    }
  }, [veiculos, veiculoId]);

  const registrar = (e) => {
    e.preventDefault();
    createIncidentMutation.mutate({
      tipo,
      descricao,
      veiculoId: veiculoId ? veiculoId : null,
    });
  };

  return (
    <div>
      <div className="flex flex-col mb-5">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Ocorrências Operacionais
        </h2>
        <p className="text-sm text-slate-600">
          Registro e acompanhamento de atrasos, imprevistos mecânicos ou desvios
          de rota.
        </p>
      </div>

      <div
        className={`page-layout incident-layout ${canCreate ? "admin-layout" : ""}`}
      >
        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-bold">Histórico de Ocorrências</h3>
            <span className="rounded-sm bg-[#FFD84A] px-3 py-1 text-xs font-bold text-slate-950">
              {ocorrencias.length} registro(s)
            </span>
          </div>
          {(incidentsQuery.isError || vehiclesQuery.isError) && (
            <p className="text-sm text-red-600">
              Erro ao carregar as ocorrências ou os veículos.
            </p>
          )}
          {ocorrencias.length === 0 ? (
            <p className="text-sm text-slate-600">
              Nenhuma ocorrência registrada até o momento.
            </p>
          ) : (
            <div className="divide-y divide-slate-200">
              {ocorrencias.map((oc) => (
                <div key={oc.id} className="py-3.5 first:pt-0 last:pb-0">
                  <strong className="text-sm *: flex items-center gap-1">
                    <AlertTriangle className="inline-block h-4 w-4 mb-[2px] text-[#FFD84A]" />
                    {oc.tipo} - {oc.veiculo?.nome || "Frota Geral"}
                  </strong>
                  <p className="my-1.5 text-sm text-slate-700">
                    {oc.descricao}
                  </p>
                  <time className="text-xs text-slate-600">
                    {new Date(oc.criadoEm).toLocaleString("pt-BR")} -{" "}
                    {oc.motorista?.nome || "Motorista"}
                  </time>
                </div>
              ))}
            </div>
          )}
        </div>

        {canCreate && (
          <div className="card mt-5">
            <h3 className="mb-4 text-base font-bold">
              Registrar Nova Ocorrência
            </h3>
            <form onSubmit={registrar} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Tipo de ocorrência
                </label>
                <select
                  className="min-w-full cursor-pointer rounded-sm border border-[#403A46] bg-[#111114] p-3 text-sm text-slate-600 transition hover:border-[#5A5360] focus:border-[#FFD84A] focus:outline-none"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                >
                  <option>Atraso</option>
                  <option>Problema mecânico</option>
                  <option>Desvio de rota</option>
                  <option>Indisponibilidade de veículo</option>
                  <option>Outro</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Veículo envolvido
                </label>
                <select
                  className="min-w-full cursor-pointer rounded-sm border border-[#403A46] bg-[#111114] p-3 text-sm text-slate-600 transition hover:border-[#5A5360] focus:border-[#FFD84A] focus:outline-none"
                  value={veiculoId}
                  onChange={(e) => setVeiculoId(e.target.value)}
                >
                  {veiculos.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.nome} ({v.placa})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Descrição detalhada
                </label>
                <textarea
                  required
                  maxLength={1000}
                  rows={4}
                  className="min-w-full rounded-sm border border-[#403A46] bg-[#111114] p-3 text-sm text-slate-600 transition hover:border-[#5A5360] focus:border-[#FFD84A] focus:outline-none"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Informe o ocorrido e o impacto previsto..."
                />
              </div>
              {createIncidentMutation.isError && (
                <p className="text-sm text-red-600">
                  Erro ao registrar a ocorrência.
                </p>
              )}
              <SubmitButton
                text="Registrar Ocorrência"
                loading={createIncidentMutation.isPending}
              />
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
