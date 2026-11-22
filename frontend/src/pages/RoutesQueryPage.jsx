import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import DotsJumping from "../components/DotsJumping";
import { RefreshButton } from "../components/RefreshButton";

export const RoutesQueryPage = () => {
  const { user } = useAuth();
  const hojeISO = new Date().toISOString().split("T")[0];

  const [mode, setMode] = useState("auto");
  const [dataConsulta, setDataConsulta] = useState(hojeISO);
  const [universidadeId, setUniversidadeId] = useState(
    user?.universidadeId || 1,
  );
  const [consultaManual, setConsultaManual] = useState(null);

  const universitiesQuery = useQuery({
    queryKey: ["universities"],
    queryFn: async () => (await api.get("/universidades")).data,
  });
  const universidades = universitiesQuery.data || [];

  useEffect(() => {
    if (!user?.universidadeId && universidades.length > 0) {
      setUniversidadeId(universidades[0].id);
    }
  }, [user, universidades]);

  const automaticRouteQuery = useQuery({
    queryKey: ["my-route", hojeISO],
    queryFn: async () => {
      const { data } = await api.get(`/rotas/minha-rota?data=${hojeISO}`);
      return data || null;
    },
    enabled: mode === "auto",
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  });
  const manualRouteQuery = useQuery({
    queryKey: [
      "route-lookup",
      consultaManual?.data,
      consultaManual?.universidadeId,
    ],
    queryFn: async () => {
      const { data } = await api.get(
        `/rotas/consulta?data=${consultaManual.data}&universidadeId=${consultaManual.universidadeId}`,
      );
      return data || null;
    },
    enabled: mode === "manual" && Boolean(consultaManual),
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  });
  const rotas =
    mode === "manual" && consultaManual
      ? manualRouteQuery.data
      : automaticRouteQuery.data;
  const loading =
    (mode === "manual" && consultaManual && manualRouteQuery.isFetching) ||
    (mode === "auto" && automaticRouteQuery.isFetching);

  const consultarManual = (e) => {
    e.preventDefault();
    setConsultaManual({ data: dataConsulta, universidadeId });
  };

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            {user?.perfil === "MOTORISTA"
              ? "Itinerário do Motorista"
              : "Consultar Rotas e Horários"}
          </h2>
          <p className="text-sm text-slate-600">
            {user?.perfil === "MOTORISTA"
              ? "Confira a sequência de universidades e o horário previsto do seu veículo."
              : "Visualize sua rota automática de hoje ou pesquise por outra data e instituição."}
          </p>
        </div>
        <RefreshButton className="hidden md:flex" />
      </div>

      {user?.perfil === "UNIVERSITARIO" && (
        <div className="my-5 flex flex-wrap gap-2">
          <button
            className={`rounded-sm border px-4 py-2 text-xs font-bold transition ${
              mode === "auto"
                ? "border-[#FFD84A] bg-brand-darker text-white"
                : "border-[#403A46] bg-[#211F27] text-slate-600 hover:bg-[#302C36]"
            }`}
            onClick={() => setMode("auto")}
          >
            Minha rota (Automática)
          </button>
          <button
            className={`rounded-sm border px-4 py-2 text-xs font-bold transition ${
              mode === "manual"
                ? "border-[#FFD84A] bg-brand-darker text-white"
                : "border-[#403A46] bg-[#211F27] text-slate-600 hover:bg-[#302C36]"
            }`}
            onClick={() => setMode("manual")}
          >
            Consulta manual
          </button>
        </div>
      )}

      {mode === "manual" && user?.perfil === "UNIVERSITARIO" && (
        <form className="card mb-5" onSubmit={consultarManual}>
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                Data da viagem
              </label>
              <input
                type="date"
                className="min-w-full cursor-pointer rounded-sm border border-[#403A46] bg-[#111114] p-3 text-sm text-slate-600 transition hover:border-[#5A5360] focus:border-[#FFD84A] focus:outline-none"
                value={dataConsulta}
                onChange={(e) => setDataConsulta(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">
                Universidade
              </label>
              <select
                className="min-w-full pb-[15px] cursor-pointer rounded-sm border border-[#403A46] bg-[#111114] p-3 text-sm text-slate-600 transition hover:border-[#5A5360] focus:border-[#FFD84A] focus:outline-none"
                value={universidadeId}
                onChange={(e) => setUniversidadeId(e.target.value)}
              >
                {universidades.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="bg-[#FFD84A] px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-[#e6c200]"
          >
            Consultar rota
          </button>
        </form>
      )}
      {(universitiesQuery.isError ||
        (mode === "auto" && automaticRouteQuery.isError) ||
        (mode === "manual" && manualRouteQuery.isError)) && (
        <p className="mb-3 text-sm text-red-600">
          Erro ao consultar os dados de rota.
        </p>
      )}
      {loading ? (
        <div className="card">
          <p className="text-sm text-slate-600">
            Buscando programação
            <DotsJumping />
          </p>
        </div>
      ) : rotas && rotas.length > 0 ? (
        rotas.map((rota, index) => (
          <div className="page-layout query-result-layout mb-5" key={index}>
            <div className="card">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-bold">Resultado da Consulta</h3>
                <span className="rounded-sm bg-green-400 px-3 py-1 text-xs font-bold text-green-700">
                  Rota programada
                </span>
              </div>

              <div className="mb-4 flex items-center gap-3.5">
                <div className="text-3xl">🚌</div>
                <div>
                  <strong className="text-xl font-extrabold">
                    {rota.veiculo.nome}
                  </strong>
                  <div className="text-xs text-slate-600">
                    Placa {rota.veiculo.placa} - Capacidade{" "}
                    {rota.veiculo.capacidade} lugares
                  </div>
                </div>
              </div>

              <div className="mb-4 rounded-sm bg-brand-darker p-5 text-white">
                <div className="text-xs text-slate-300">
                  Horário previsto de saída
                </div>
                <div className="mt-1 text-4xl font-extrabold text-[#FFD84A]">
                  {rota.horarioPrevisto}
                </div>
              </div>

              <strong className="text-sm">
                Sequência de paradas (Universidades)
              </strong>
              <div className="mt-3 grid gap-2.5">
                {rota.paradas.map((p) => (
                  <div
                    key={p.universidade.id}
                    className="flex items-center gap-3 rounded-sm border border-[#403A46] bg-[#302C36] p-3"
                  >
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-sm bg-[#FFD84A]  text-xs font-extrabold text-slate-900">
                      {p.ordem}
                    </span>
                    <div>
                      <div className="text-sm font-bold">
                        {p.universidade.nome}
                      </div>
                      <div className="text-xs text-slate-600">
                        {p.universidade.localizacao}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card space-y-2">
              <h3 className="mb-2 text-base font-bold">
                Informações Operacionais
              </h3>
              <p className="text-sm text-slate-600">
                Data:{" "}
                <strong>
                  {rota.dataOperacao.split("-").reverse().join("/")}
                </strong>
              </p>
              <p className="text-sm text-slate-600">
                Turno: <strong>{rota.turno}</strong>
              </p>
              <p className="text-sm text-slate-600">
                Motorista escalado:{" "}
                <strong>{rota.motorista?.nome || "A definir"}</strong>
              </p>
            </div>
          </div>
        ))
      ) : (
        <div className="card">
          <p className="text-sm text-slate-600">
            Nenhuma rota encontrada para os critérios selecionados. Tente
            consultar a data de hoje ou amanhã.
          </p>
        </div>
      )}
    </div>
  );
};
