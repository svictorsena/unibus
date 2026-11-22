import React, { useEffect, useState } from "react";
import api from "../services/api";
import SubmitButton from "../components/SubmitButton";

export const ManageRoutesPage = () => {
  const hojeISO = new Date().toISOString().split("T")[0];

  const [dataOperacao, setDataOperacao] = useState(hojeISO);
  const [rotas, setRotas] = useState([]);
  const [universidades, setUniversidades] = useState([]);
  const [motoristas, setMotoristas] = useState([]);

  const [selectedUni, setSelectedUni] = useState(0);
  const [selectedVeh, setSelectedVeh] = useState(0);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  const notify = (msg, bad = false) => {
    setToast({ msg, bad });
    setTimeout(() => setToast(null), 3500);
  };

  const carregarDados = async (dataStr) => {
    const [rotasRes, uniRes, motRes] = await Promise.all([
      api.get(`/rotas?data=${dataStr}`),
      api.get("/universidades"),
      api.get("/motoristas"),
    ]);

    setRotas(rotasRes.data);
    setUniversidades(uniRes.data);
    setMotoristas(motRes.data);

    if (uniRes.data.length > 0 && !selectedUni)
      setSelectedUni(uniRes.data[0].id);
    if (rotasRes.data.length > 0 && !selectedVeh)
      setSelectedVeh(rotasRes.data[0].veiculo.id);
  };

  useEffect(() => {
    carregarDados(dataOperacao);
  }, [dataOperacao]);

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

  const salvarNoBanco = async () => {
    setSaving(true);

    try {
      const payload = {
        dataOperacao,
        rotas: rotas.map((r) => ({
          veiculoId: r.veiculo.id,
          motoristaId: r.motorista?.id || null,
          horarioPrevisto: r.horarioPrevisto || "18:30",
          universidadeIds: r.paradas.map((p) => p.universidade.id),
        })),
      };

      const { data } = await api.post("/rotas/configurar", payload);
      setRotas(data);

      notify("Configuração de rotas salva com sucesso!");
    } catch (err) {
      notify(err.response?.data?.message || "Erro ao salvar rotas.", true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex flex-row items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Configuração Dinâmica de Rotas
          </h2>
          <p className="text-sm text-slate-600">
            Associe e redistribua universidades entre os veículos conforme a
            demanda de cada dia.
          </p>
        </div>
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
        {rotas.map((r) => (
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
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700">
              Veículo de destino
            </label>
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
      <SubmitButton onClick={salvarNoBanco} disabled={saving} text="Salvar configuração do dia" loading={saving} />

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
