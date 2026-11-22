import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";
import { RefreshButton } from "../components/RefreshButton";
import { Skeleton } from "../components/Skeleton";
import SubmitButton from "../components/SubmitButton";

export const ManageRoutesPage = () => {
  const queryClient = useQueryClient();
  const hojeISO = new Date().toISOString().split("T")[0];

  const [dataOperacao, setDataOperacao] = useState(hojeISO);
  const [rotas, setRotas] = useState([]);

  const [selectedUni, setSelectedUni] = useState(0);
  const [selectedVeh, setSelectedVeh] = useState(0);
  const [toast, setToast] = useState(null);

  const notify = (msg, bad = false) => {
    setToast({ msg, bad });
    setTimeout(() => setToast(null), 3500);
  };

  const routesQuery = useQuery({
    queryKey: ["routes", dataOperacao],
    queryFn: async () => (await api.get(`/rotas?data=${dataOperacao}`)).data,
  });
  const universitiesQuery = useQuery({
    queryKey: ["universities"],
    queryFn: async () => (await api.get("/universidades")).data,
  });
  const driversQuery = useQuery({
    queryKey: ["drivers"],
    queryFn: async () => (await api.get("/motoristas")).data,
  });
  const universidades = universitiesQuery.data || [];
  const motoristas = driversQuery.data || [];
  const routesLoading =
    routesQuery.isLoading ||
    (Boolean(routesQuery.data?.length) && rotas.length === 0);

  useEffect(() => {
    if (!routesQuery.data) return;
    setRotas(routesQuery.data);
    if (routesQuery.data.length > 0 && !selectedVeh) {
      setSelectedVeh(routesQuery.data[0].veiculo.id);
    }
  }, [routesQuery.data, selectedVeh]);

  useEffect(() => {
    if (universidades.length > 0 && !selectedUni) {
      setSelectedUni(universidades[0].id);
    }
  }, [universidades, selectedUni]);

  const moverParada = (veiculoId, index, dir) => {
    setRotas((prev) =>
      prev.map((r) => {
        if (r.veiculo.id !== veiculoId) return r;
        const list = [...r.paradas];
        const target = index + dir;
        if (target < 0 || target >= list.length) return r;
        [list[index], list[target]] = [list[target], list[index]];
        return {
          ...r,
          paradas: list.map((p, idx) => ({ ...p, ordem: idx + 1 })),
        };
      }),
    );
  };

  const atribuirUniversidade = () => {
    const uni = universidades.find((u) => u.id === selectedUni);
    if (!uni || !selectedVeh) return;

    setRotas((prev) =>
      prev.map((r) => {
        const filtradas = r.paradas.filter((p) => p.universidade.id !== uni.id);
        const novaLista =
          r.veiculo.id === selectedVeh
            ? [...filtradas, { universidade: uni, ordem: filtradas.length + 1 }]
            : filtradas;
        return {
          ...r,
          paradas: novaLista.map((p, i) => ({ ...p, ordem: i + 1 })),
        };
      }),
    );
    notify(`${uni.nome} atribuída ao veículo selecionado.`);
  };

  const removerDaData = () => {
    setRotas((prev) =>
      prev.map((r) => ({
        ...r,
        paradas: r.paradas
          .filter((p) => p.universidade.id !== selectedUni)
          .map((p, i) => ({ ...p, ordem: i + 1 })),
      })),
    );
    notify("Universidade removida da programação desta data.");
  };

  const atualizarHorario = (veiculoId, horario) => {
    setRotas((prev) =>
      prev.map((r) =>
        r.veiculo.id === veiculoId ? { ...r, horarioPrevisto: horario } : r,
      ),
    );
  };

  const atualizarMotorista = (veiculoId, motoristaId) => {
    const mot = motoristas.find((m) => m.id === motoristaId) || null;
    setRotas((prev) =>
      prev.map((r) =>
        r.veiculo.id === veiculoId ? { ...r, motorista: mot } : r,
      ),
    );
  };

  const saveRoutesMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post("/rotas/configurar", payload);
      return data;
    },
    onSuccess: (data) => {
      setRotas(data);
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      queryClient.invalidateQueries({ queryKey: ["my-route"] });
      queryClient.invalidateQueries({ queryKey: ["route-lookup"] });
      notify("Configuração de rotas salva com sucesso!");
    },
    onError: (err) =>
      notify(err.response?.data?.message || "Erro ao salvar rotas.", true),
  });

  const salvarNoBanco = () => {
    saveRoutesMutation.mutate({
      dataOperacao,
      rotas: rotas.map((r) => ({
        veiculoId: r.veiculo.id,
        motoristaId: r.motorista?.id || null,
        horarioPrevisto: r.horarioPrevisto || "18:30",
        universidadeIds: r.paradas.map((p) => p.universidade.id),
      })),
    });
  };

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Configuração Dinâmica de Rotas
          </h2>
          <p className="text-sm text-slate-600">
            Associe e redistribua universidades entre os veículos conforme a
            demanda de cada dia.
          </p>
        </div>
        <RefreshButton className="hidden md:flex" />
      </div>

      <div className="operation-date-panel">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700">
              Data de operação
            </label>
            <input
              type="date"
              className="min-w-full cursor-pointer rounded-sm border border-[#403A46] bg-[#111114] p-3 text-sm text-slate-600 transition hover:border-[#5A5360] focus:border-[#FFD84A] focus:outline-none"
              value={dataOperacao}
              onChange={(e) => setDataOperacao(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700">
              Turno
            </label>
            <input
              className="min-w-full cursor-pointer rounded-sm border border-[#403A46] bg-[#111114] p-3 text-sm text-slate-600 transition hover:border-[#5A5360] focus:border-[#FFD84A] focus:outline-none bg-[#26232C]"
              value="Noturno"
              disabled
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 mt-5">
        {(routesQuery.isError ||
          universitiesQuery.isError ||
          driversQuery.isError) && (
          <p className="text-sm text-red-600">
            Erro ao carregar os dados para configurar as rotas.
          </p>
        )}
        {routesLoading
          ? [0, 1, 2].map((item) => (
              <div key={item} className="card flex flex-col gap-3">
                <Skeleton className="mb-1 h-5 w-40" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="mt-2 h-3 w-28" />
                <Skeleton className="h-[46px] w-full" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-[46px] w-full" />
              </div>
            ))
          : rotas.map((r) => (
          <div key={r.veiculo.id} className="card flex flex-col gap-2.5">
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-base font-bold">🚌 {r.veiculo.nome}</h3>
              <span
                className={`rounded-sm px-2.5 py-1 text-xs font-bold ${
                  r.paradas.length
                    ? "bg-green-400 text-green-700"
                    : "bg-[#FFD84A] text-slate-950"
                }`}
              >
                {r.paradas.length} universidade(s)
              </span>
            </div>

            {r.paradas.length === 0 ? (
              <p className="text-xs text-slate-600">
                Nenhuma universidade atribuída.
              </p>
            ) : (
              r.paradas.map((p, idx) => (
                <div
                  key={p.universidade.id}
                  className="flex items-center gap-2.5 rounded-sm border border-[#403A46] bg-[#302C36] px-3 py-2"
                >
                  <div className="grid h-6 w-6 shrink-0 place-items-center rounded-sm bg-brand-dark text-xs font-bold text-white">
                    {idx + 1}
                  </div>
                  <div className="flex-1 text-xs font-semibold">
                    {p.universidade.nome}
                  </div>
                  <button
                    type="button"
                    className="h-7 w-7 rounded-sm border border-slate-300 bg-[#211F27] font-bold disabled:opacity-40"
                    disabled={idx === 0}
                    onClick={() => moverParada(r.veiculo.id, idx, -1)}
                    title="Subir parada"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="h-7 w-7 rounded-sm border border-slate-300 bg-[#211F27] font-bold disabled:opacity-40"
                    disabled={idx === r.paradas.length - 1}
                    onClick={() => moverParada(r.veiculo.id, idx, 1)}
                    title="Descer parada"
                  >
                    ↓
                  </button>
                </div>
              ))
            )}

            <div className="mt-2">
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Horário previsto
              </label>
              <input
                type="time"
                className="min-w-full rounded-sm cursor-pointer border border-[#403A46] bg-[#111114] p-3 text-sm text-slate-600 transition hover:border-[#5A5360] focus:border-[#FFD84A] focus:outline-none"
                value={r.horarioPrevisto}
                onChange={(e) => atualizarHorario(r.veiculo.id, e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Motorista escalado
              </label>
              {driversQuery.isLoading ? (
                <Skeleton className="h-[46px] w-full" />
              ) : (
                <select
                  className="min-w-full rounded-sm cursor-pointer border border-[#403A46] bg-[#111114] p-3 text-sm text-slate-600 transition hover:border-[#5A5360] focus:border-[#FFD84A] focus:outline-none"
                  value={r.motorista?.id || ""}
                  onChange={(e) =>
                    atualizarMotorista(r.veiculo.id, e.target.value)
                  }
                >
                  <option value="">Sem motorista definido</option>
                  {motoristas.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nome}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold">
            Redistribuir / Atribuir Universidade
          </h3>
        </div>
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700">
              Universidade
            </label>
            {universitiesQuery.isLoading ? (
              <Skeleton className="h-[46px] w-full" />
            ) : (
              <select
                className="min-w-full rounded-sm cursor-pointer border border-[#403A46] bg-[#111114] p-3 text-sm text-slate-600 transition hover:border-[#5A5360] focus:border-[#FFD84A] focus:outline-none"
                value={selectedUni}
                onChange={(e) => setSelectedUni(e.target.value)}
              >
                {universidades.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nome}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700">
              Veículo de destino
            </label>
            {routesLoading ? (
              <Skeleton className="h-[46px] w-full" />
            ) : (
              <select
                className="min-w-full rounded-sm cursor-pointer border border-[#403A46] bg-[#111114] p-3 text-sm text-slate-600 transition hover:border-[#5A5360] focus:border-[#FFD84A] focus:outline-none"
                value={selectedVeh}
                onChange={(e) => setSelectedVeh(e.target.value)}
              >
                {rotas.map((r) => (
                  <option key={r.veiculo.id} value={r.veiculo.id}>
                    {r.veiculo.nome} ({r.veiculo.placa})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            className="bg-[#FFD84A] text-slate-950 text-sm font-bold px-4 py-2 hover:bg-[#e6c200]"
            onClick={atribuirUniversidade}
          >
            Aplicar redistribuição
          </button>
          <button
            type="button"
            className="bg-[#111114] border text-slate-200 border-[#403A46] text-sm font-bold px-4 py-2 hover:bg-[#302C36] hover:border-[#5A5360]"
            onClick={removerDaData}
          >
            Retirar da rota do dia
          </button>
        </div>
      </div>
      <SubmitButton
        onClick={salvarNoBanco}
        disabled={saveRoutesMutation.isPending}
        text="Salvar configuração do dia"
        loading={saveRoutesMutation.isPending}
      />

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-sm px-4 py-3 text-sm font-semibold text-white shadow-xl ${
            toast.bad ? "bg-red-700" : "bg-brand-darker"
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
};
