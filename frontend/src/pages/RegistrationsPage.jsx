import { useEffect, useState } from "react";
import api from "../services/api";
import SubmitButton from "../components/SubmitButton";

export const RegistrationsPage = () => {
  const [tab, setTab] = useState("universitarios");
  const [universitarios, setUniversitarios] = useState([]);
  const [universidades, setUniversidades] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
  const [toast, setToast] = useState(null);

  const [uniForm, setUniForm] = useState({
    nome: "",
    email: "",
    curso: "",
    telefone: "",
    universidadeId: "",
  });
  const [instForm, setInstForm] = useState({ nome: "", localizacao: "" });
  const [veicForm, setVeicForm] = useState({
    nome: "",
    placa: "",
    modelo: "",
    capacidade: 44,
    motoristaId: "",
  });
  const [motForm, setMotForm] = useState({ nome: "", email: "", telefone: "" });

  const notify = (msg, bad = false) => {
    setToast({ msg, bad });
    setTimeout(() => setToast(null), 3200);
  };

  const carregarTudo = async () => {
    const [uRes, instRes, vRes, mRes] = await Promise.all([
      api.get("/universitarios"),
      api.get("/universidades"),
      api.get("/veiculos"),
      api.get("/motoristas"),
    ]);
    setUniversitarios(uRes.data);
    setUniversidades(instRes.data);
    setVeiculos(vRes.data);
    setMotoristas(mRes.data);
    if (instRes.data.length > 0 && !uniForm.universidadeId) {
      setUniForm((f) => ({ ...f, universidadeId: String(instRes.data[0].id) }));
    }
  };

  useEffect(() => {
    carregarTudo();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if (tab === "universitarios") {
        await api.post("/universitarios", {
          ...uniForm,
          universidadeId: uniForm.universidadeId,
        });
        setUniForm({
          ...uniForm,
          nome: "",
          email: "",
          curso: "",
          telefone: "",
        });
      } else if (tab === "universidades") {
        await api.post("/universidades", instForm);
        setInstForm({ nome: "", localizacao: "" });
      } else if (tab === "veiculos") {
        await api.post("/veiculos", {
          ...veicForm,
          capacidade: Number(veicForm.capacidade),
          motoristaId: veicForm.motoristaId
            ? veicForm.motoristaId
            : null,
        });
        setVeicForm({
          nome: "",
          placa: "",
          modelo: "",
          capacidade: 44,
          motoristaId: "",
        });
      } else if (tab === "motoristas") {
        await api.post("/motoristas", motForm);
        setMotForm({ nome: "", email: "", telefone: "" });
      }
      await carregarTudo();
      notify("Registro cadastrado com sucesso!");
    } catch (err) {
      notify(err.response?.data?.message || "Erro ao cadastrar.", true);
    }
  };

  const handleDelete = async (endpoint, id) => {
    if (!window.confirm("Deseja realmente excluir este registro?")) return;
    try {
      await api.delete(`/${endpoint}/${id}`);
      await carregarTudo();
      notify("Registro removido.");
    } catch {
      notify(
        "Não foi possível excluir: registro vinculado a rotas ativas.",
        true,
      );
    }
  };

  const tabs = [
    {
      id: "universitarios",
      label: `Universitários (${universitarios.length})`,
    },
    { id: "universidades", label: `Universidades (${universidades.length})` },
    { id: "veiculos", label: `Veículos (${veiculos.length})` },
    { id: "motoristas", label: `Motoristas (${motoristas.length})` },
  ];

  return (
    <div>
      <div className="flex flex-col mb-5">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Cadastros do Sistema
        </h2>
        <p className="text-sm text-slate-600">
          Gerencie universitários, instituições de ensino, veículos e
          motoristas.
        </p>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-sm border px-4 py-2 text-xs font-bold transition ${
              tab === t.id
                ? "border-[#FFD84A] bg-[#08070B] text-white"
                : "border-[#403A46] bg-[#211F27] text-slate-600 hover:bg-[#302C36]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="page-layout registrations-layout">
        <div className="card">
          <h3 className="mb-3 text-base font-bold">Registros Cadastrados</h3>
          <div className="overflow-x-auto">
            {tab === "universitarios" && (
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-[#403A46] text-xs uppercase text-slate-600">
                    <th className="p-3">Nome / E-mail</th>
                    <th className="p-3">Universidade</th>
                    <th className="p-3">Curso</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {universitarios.map((u) => (
                    <tr key={u.id}>
                      <td className="p-3">
                        <strong>{u.nome}</strong>
                        <div className="text-xs text-slate-600">{u.email}</div>
                      </td>
                      <td className="p-3">{u.universidadeNome || "—"}</td>
                      <td className="p-3">{u.curso || "—"}</td>
                      <td className="p-3">
                        <button
                          className="btn-danger btn-sm"
                          onClick={() => handleDelete("universitarios", u.id)}
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === "universidades" && (
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-[#403A46] text-xs uppercase text-slate-600">
                    <th className="p-3">Instituição</th>
                    <th className="p-3">Localização / Referência</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {universidades.map((u) => (
                    <tr key={u.id}>
                      <td className="p-3 font-bold">{u.nome}</td>
                      <td className="p-3">{u.localizacao}</td>
                      <td className="p-3">
                        <button
                          className="btn-danger btn-sm"
                          onClick={() => handleDelete("universidades", u.id)}
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === "veiculos" && (
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-[#403A46] text-xs uppercase text-slate-600">
                    <th className="p-3">Veículo</th>
                    <th className="p-3">Placa / Modelo</th>
                    <th className="p-3">Capacidade</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {veiculos.map((v) => (
                    <tr key={v.id}>
                      <td className="p-3 font-bold">{v.nome}</td>
                      <td className="p-3">
                        {v.placa} · {v.modelo}
                      </td>
                      <td className="p-3">{v.capacidade} lug.</td>
                      <td className="p-3">
                        <button
                          className="btn-danger btn-sm"
                          onClick={() => handleDelete("veiculos", v.id)}
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === "motoristas" && (
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-[#403A46] text-xs uppercase text-slate-600">
                    <th className="p-3">Nome</th>
                    <th className="p-3">E-mail</th>
                    <th className="p-3">Telefone</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {motoristas.map((m) => (
                    <tr key={m.id}>
                      <td className="p-3 font-bold">{m.nome}</td>
                      <td className="p-3">{m.email}</td>
                      <td className="p-3">{m.telefone}</td>
                      <td className="p-3">
                        <button
                          className="btn-danger btn-sm"
                          onClick={() => handleDelete("motoristas", m.id)}
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="card mt-5">
          <h3 className="mb-4 text-base font-bold">Novo Cadastro</h3>
          <form onSubmit={handleCreate} className="space-y-3.5">
            {tab === "universitarios" && (
              <>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Nome completo
                  </label>
                  <input
                    required
                    className="min-w-full rounded-sm border border-[#403A46] bg-[#111114] p-3 text-sm text-slate-600 transition hover:border-[#5A5360] focus:border-[#FFD84A] focus:outline-none"
                    value={uniForm.nome}
                    onChange={(e) =>
                      setUniForm({ ...uniForm, nome: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    E-mail
                  </label>
                  <input
                    type="email"
                    required
                    className="min-w-full rounded-sm border border-[#403A46] bg-[#111114] p-3 text-sm text-slate-600 transition hover:border-[#5A5360] focus:border-[#FFD84A] focus:outline-none"
                    value={uniForm.email}
                    onChange={(e) =>
                      setUniForm({ ...uniForm, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Universidade vinculada
                  </label>
                  <select
                    required
                    className="min-w-full cursor-pointer rounded-sm border border-[#403A46] bg-[#111114] p-3 text-sm text-slate-600 transition hover:border-[#5A5360] focus:border-[#FFD84A] focus:outline-none"
                    value={uniForm.universidadeId}
                    onChange={(e) =>
                      setUniForm({ ...uniForm, universidadeId: e.target.value })
                    }
                  >
                    {universidades.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Curso
                  </label>
                  <input
                    className="min-w-full rounded-sm border border-[#403A46] bg-[#111114] p-3 text-sm text-slate-600 transition hover:border-[#5A5360] focus:border-[#FFD84A] focus:outline-none"
                    value={uniForm.curso}
                    onChange={(e) =>
                      setUniForm({ ...uniForm, curso: e.target.value })
                    }
                    placeholder="Ex.: Sistemas de Informação"
                  />
                </div>
              </>
            )}

            {tab === "universidades" && (
              <>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Nome da universidade
                  </label>
                  <input
                    required
                    className="min-w-full rounded-sm border border-[#403A46] bg-[#111114] p-3 text-sm text-slate-600 transition hover:border-[#5A5360] focus:border-[#FFD84A] focus:outline-none"
                    value={instForm.nome}
                    onChange={(e) =>
                      setInstForm({ ...instForm, nome: e.target.value })
                    }
                    placeholder="Ex.: UNIFACIMP WYDEN"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Localização / Ponto de desembarque
                  </label>
                  <input
                    required
                    className="min-w-full rounded-sm border border-[#403A46] bg-[#111114] p-3 text-sm text-slate-600 transition hover:border-[#5A5360] focus:border-[#FFD84A] focus:outline-none"
                    value={instForm.localizacao}
                    onChange={(e) =>
                      setInstForm({ ...instForm, localizacao: e.target.value })
                    }
                    placeholder="Endereço ou referência"
                  />
                </div>
              </>
            )}

            {tab === "veiculos" && (
              <>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Identificação do veículo
                  </label>
                  <input
                    required
                    className="min-w-full rounded-sm border border-[#403A46] bg-[#111114] p-3 text-sm text-slate-600 transition hover:border-[#5A5360] focus:border-[#FFD84A] focus:outline-none"
                    value={veicForm.nome}
                    onChange={(e) =>
                      setVeicForm({ ...veicForm, nome: e.target.value })
                    }
                    placeholder="Ex.: Ônibus 04"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Placa
                  </label>
                  <input
                    required
                    className="min-w-full rounded-sm border border-[#403A46] bg-[#111114] p-3 text-sm text-slate-600 transition hover:border-[#5A5360] focus:border-[#FFD84A] focus:outline-none"
                    value={veicForm.placa}
                    onChange={(e) =>
                      setVeicForm({ ...veicForm, placa: e.target.value })
                    }
                    placeholder="ABC-1234"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Capacidade máxima (lugares)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    required
                    className="min-w-full rounded-sm border border-[#403A46] bg-[#111114] p-3 text-sm text-slate-600 transition hover:border-[#5A5360] focus:border-[#FFD84A] focus:outline-none"
                    value={veicForm.capacidade}
                    onChange={(e) =>
                      setVeicForm({
                        ...veicForm,
                        capacidade: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Motorista padrão (opcional)
                  </label>
                  <select
                    className="min-w-full cursor-pointer rounded-sm border border-[#403A46] bg-[#111114] p-3 text-sm text-slate-600 transition hover:border-[#5A5360] focus:border-[#FFD84A] focus:outline-none"
                    value={veicForm.motoristaId}
                    onChange={(e) =>
                      setVeicForm({ ...veicForm, motoristaId: e.target.value })
                    }
                  >
                    <option value="">Nenhum</option>
                    {motoristas.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {tab === "motoristas" && (
              <>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Nome do motorista
                  </label>
                  <input
                    required
                    className="min-w-full rounded-sm border border-[#403A46] bg-[#111114] p-3 text-sm text-slate-600 transition hover:border-[#5A5360] focus:border-[#FFD84A] focus:outline-none"
                    value={motForm.nome}
                    onChange={(e) =>
                      setMotForm({ ...motForm, nome: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    E-mail
                  </label>
                  <input
                    type="email"
                    required
                    className="min-w-full rounded-sm border border-[#403A46] bg-[#111114] p-3 text-sm text-slate-600 transition hover:border-[#5A5360] focus:border-[#FFD84A] focus:outline-none"
                    value={motForm.email}
                    onChange={(e) =>
                      setMotForm({ ...motForm, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Telefone
                  </label>
                  <input
                    required
                    className="min-w-full rounded-sm border border-[#403A46] bg-[#111114] p-3 text-sm text-slate-600 transition hover:border-[#5A5360] focus:border-[#FFD84A] focus:outline-none"
                    value={motForm.telefone}
                    onChange={(e) =>
                      setMotForm({ ...motForm, telefone: e.target.value })
                    }
                    placeholder="(99) 99999-9999"
                  />
                </div>
              </>
            )}

            <SubmitButton text="Salvar cadastro" />
          </form>
        </div>
      </div>

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
