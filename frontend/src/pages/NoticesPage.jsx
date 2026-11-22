import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import SubmitButton from "../components/SubmitButton";

export const NoticesPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.perfil === "ADMIN";

  const [avisos, setAvisos] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);

  const carregar = async () => {
    const { data } = await api.get("/avisos");
    setAvisos(data);
  };

  useEffect(() => {
    carregar();
  }, []);

  const publicar = async (e) => {
    e.preventDefault();
    setLoading(true);
    await api.post("/avisos", { titulo, mensagem });
    setTitulo("");
    setMensagem("");
    carregar();
    setLoading(false);
  };

  const excluir = async (id) => {
    await api.delete(`/avisos/${id}`);
    carregar();
  };

  return (
    <div>
      <div className="flex flex-col mb-5">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Quadro de Avisos
        </h2>
        <p className="text-sm text-slate-600">
          Avisos oficiais sobre horários, alterações de itinerário e avisos
          gerais.
        </p>
      </div>

      <div>
        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-bold">Avisos Publicados</h3>
            <span className="rounded-sm bg-[#FFD84A] px-3 py-1 text-xs font-bold text-slate-950">
              {avisos.length} aviso(s)
            </span>
          </div>
          {avisos.length === 0 ? (
            <p className="text-sm text-slate-600">
              Nenhum aviso publicado no momento.
            </p>
          ) : (
            <div className="divide-y divide-slate-200">
              {avisos.map((a) => (
                <div key={a.id} className="py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-2.5">
                    <strong className="text-sm">📣 {a.titulo}</strong>
                    {isAdmin && (
                      <button
                        className="btn-danger btn-sm"
                        onClick={() => excluir(a.id)}
                      >
                        Excluir
                      </button>
                    )}
                  </div>
                  <p className="my-1.5 text-sm text-slate-700">{a.mensagem}</p>
                  <time className="text-xs text-slate-600">
                    Publicado em {new Date(a.criadoEm).toLocaleString("pt-BR")}
                    {a.criadoPor ? ` - por ${a.criadoPor.nome}` : ""}
                  </time>
                </div>
              ))}
            </div>
          )}
        </div>

        {isAdmin && (
          <div className="card mt-5">
            <h3 className="mb-4 text-base font-bold">Publicar Novo Aviso</h3>
            <form onSubmit={publicar} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Título
                </label>
                <input
                  required
                  maxLength={120}
                  className="min-w-full rounded-sm border border-[#403A46] bg-[#111114] p-3 text-sm text-slate-600 transition hover:border-[#5A5360] focus:border-[#FFD84A] focus:outline-none"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex.: Alteração no horário de saída"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Mensagem
                </label>
                <textarea
                  required
                  maxLength={1000}
                  rows={4}
                  className="min-w-full rounded-sm border border-[#403A46] bg-[#111114] p-3 text-sm text-slate-600 transition hover:border-[#5A5360] focus:border-[#FFD84A] focus:outline-none"
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  placeholder="Descreva os detalhes do aviso..."
                />
              </div>
              <SubmitButton text="Publicar Aviso" loading={loading} />
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
