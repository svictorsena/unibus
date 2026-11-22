import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import SubmitButton from "../components/SubmitButton";

export const CalendarPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.perfil === "ADMIN";

  const [eventos, setEventos] = useState([]);
  const [data, setData] = useState(new Date().toISOString().split("T")[0]);
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState("DIA_LETIVO");

  const carregar = async () => {
    const res = await api.get("/calendario");
    setEventos(res.data);
  };

  useEffect(() => {
    carregar();
  }, []);

  const adicionar = async (e) => {
    e.preventDefault();
    await api.post("/calendario", { data, descricao, tipo });
    setDescricao("");
    carregar();
  };

  const excluir = async (id) => {
    await api.delete(`/calendario/${id}`);
    carregar();
  };

  return (
    <div>
      <div className="flex flex-col mb-5">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Calendário de Funcionamento
        </h2>
        <p className="text-sm text-slate-600">
          Dias letivos, feriados, recessos e datas com horários especiais do
          transporte.
        </p>
      </div>

      <div
        className={`page-layout calendar-layout ${isAdmin ? "admin-layout" : ""}`}
      >
        <div className="card">
          <h3 className="mb-3 text-base font-bold">Datas Programadas</h3>
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
              <SubmitButton text="Salvar no Calendário" />
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
