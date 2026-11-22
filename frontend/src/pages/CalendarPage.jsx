import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { RefreshButton } from "../components/RefreshButton";
import SubmitButton from "../components/SubmitButton";

export const CalendarPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.perfil === "ADMIN";

  const [data, setData] = useState(new Date().toISOString().split("T")[0]);
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState("DIA_LETIVO");

  const eventosQuery = useQuery({
    queryKey: ["calendar"],
    queryFn: async () => (await api.get("/calendario")).data,
  });
  const addEventMutation = useMutation({
    mutationFn: (event) => api.post("/calendario", event),
    onSuccess: () => {
      setDescricao("");
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
    },
  });
  const deleteEventMutation = useMutation({
    mutationFn: (id) => api.delete(`/calendario/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["calendar"] }),
  });

  const eventos = eventosQuery.data || [];
  const adicionar = (e) => {
    e.preventDefault();
    addEventMutation.mutate({ data, descricao, tipo });
  };
  const excluir = (id) => deleteEventMutation.mutate(id);

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Calendário de Funcionamento
          </h2>
          <p className="text-sm text-slate-600">
            Dias letivos, feriados, recessos e datas com horários especiais do
            transporte.
          </p>
        </div>
        <RefreshButton className="hidden md:flex" />
      </div>

      <div
        className={`page-layout calendar-layout ${isAdmin ? "admin-layout" : ""}`}
      >
        <div className="card">
          <h3 className="mb-3 text-base font-bold">Datas Programadas</h3>
          {eventosQuery.isError && (
            <p className="text-sm text-red-600">Erro ao carregar o calendário.</p>
          )}
          <div className="divide-y divide-slate-200">
            {eventos.map((ev) => (
              <div
                key={ev.id}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div>
                  <strong className="text-sm">
                    {ev.data.split("-").reverse().join("/")}
                  </strong>{" "}
                  — <span className="text-sm">{ev.descricao}</span>
                  <div className="mt-1">
                    <span
                      className={`rounded-sm px-2.5 py-0.5 text-[11px] font-bold ${
                        ev.tipo === "FERIADO"
                          ? "bg-red-400 text-red-700"
                          : ev.tipo === "DIA_LETIVO"
                            ? "bg-green-400 text-green-700"
                            : "bg-[#FFD84A] text-slate-950"
                      }`}
                    >
                      {ev.tipo.replace("_", " ")}
                    </span>
                  </div>
                </div>
                {isAdmin && (
                  <button
                    className="btn-danger btn-sm"
                    onClick={() => excluir(ev.id)}
                  >
                    Remover
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {isAdmin && (
          <div className="card mt-5">
            <h3 className="mb-4 text-base font-bold">
              Adicionar Data ao Calendário
            </h3>
            <form onSubmit={adicionar} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Data
                </label>
                <input
                  type="date"
                  required
                  className="min-w-full cursor-pointer rounded-sm border border-[#403A46] bg-[#111114] p-3 text-sm text-slate-600 transition hover:border-[#5A5360] focus:border-[#FFD84A] focus:outline-none"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Classificação
                </label>
                <select
                  className="min-w-full cursor-pointer rounded-sm border border-[#403A46] bg-[#111114] p-3 text-sm text-slate-600 transition hover:border-[#5A5360] focus:border-[#FFD84A] focus:outline-none"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                >
                  <option value="DIA_LETIVO">Dia Letivo</option>
                  <option value="FERIADO">Feriado (Sem transporte)</option>
                  <option value="RECESSO">Recesso Acadêmico</option>
                  <option value="HORARIO_ESPECIAL">Horário Especial</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Descrição
                </label>
                <input
                  required
                  className="min-w-full rounded-sm border border-[#403A46] bg-[#111114] p-3 text-sm text-slate-600 transition hover:border-[#5A5360] focus:border-[#FFD84A] focus:outline-none"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Ex.: Semana de provas finais"
                />
              </div>
              {(addEventMutation.isError || deleteEventMutation.isError) && (
                <p className="text-sm text-red-600">
                  Erro ao atualizar o calendário.
                </p>
              )}
              <SubmitButton
                text="Salvar no Calendário"
                loading={addEventMutation.isPending}
              />
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
