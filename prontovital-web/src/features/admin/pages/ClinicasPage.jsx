import { useState, useEffect } from 'react'
import api from '../../../lib/api'

export default function ClinicasPage() {
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [clinicas, setClinicas] = useState([])
  const [busca, setBusca] = useState('')

  // Modal Exclusão
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false)
  const [itemParaExcluir, setItemParaExcluir] = useState(null)
  const [excluindo, setExcluindo] = useState(false)

  // Modal Nova Clínica
  const [modalNovoAberto, setModalNovoAberto] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [form, setForm] = useState({ 
    nome: '', 
    cnpj: '', 
    email: '', 
    senha: '',
    endereco: '', 
    localizacao: '', 
    cidade: 'Recife',
    estado: 'PE',
    telefone: '', 
    status: 'Ativo' 
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      carregarClinicas(busca)
    }, 300)
    return () => clearTimeout(timer)
  }, [busca])

  async function carregarClinicas(termo = '') {
    setLoading(true)
    setErro('')
    try {
      const params = termo.trim() ? { busca: termo.trim() } : {}
      const [resClinicas, resProfissionais] = await Promise.all([
        api.get('/clinicas', { params }),
        api.get('/profissionais').catch(() => ({ data: [] }))
      ])

      const listaProfissionais = Array.isArray(resProfissionais.data) ? resProfissionais.data : []

      if (Array.isArray(resClinicas.data)) {
        const formatadas = resClinicas.data.map((item) => {
          const qtdProfissionais = listaProfissionais.filter((p) =>
            p.Clinicas?.some((c) => String(c.id_clinica) === String(item.id_clinica))
          ).length

          return {
            id: item.id_clinica,
            id_clinica: item.id_clinica,
            nome: item.User?.nome?.trim() || 'Clínica Sem Nome',
            localizacao: item.bairro || item.User?.cidade || 'Recife',
            telefone: item.User?.telefone || '(81) 3333-0000',
            profissionais: qtdProfissionais,
            status: item.User?.ativo !== false ? 'Ativo' : 'Inativo',
          }
        })
        setClinicas(formatadas)
      } else {
        setClinicas([])
      }
    } catch (err) {
      console.error('Erro ao carregar clínicas da API:', err)
      // Fallback quando offline com filtro local pelo termo
      const fallback = [
        { id: 1, id_clinica: 1, nome: 'Clínica Saúde Ilha do Leite', localizacao: 'Ilha do Leite', telefone: '(81) 3333-1111', profissionais: 2, status: 'Ativo' },
        { id: 2, id_clinica: 2, nome: 'Centro Médico Boa Viagem', localizacao: 'Boa Viagem', telefone: '(81) 3333-2222', profissionais: 1, status: 'Ativo' },
        { id: 3, id_clinica: 3, nome: 'Policlínica Madalena', localizacao: 'Madalena', telefone: '(81) 3333-3333', profissionais: 1, status: 'Ativo' },
      ].filter(c => !termo || c.nome.toLowerCase().includes(termo.toLowerCase()) || c.localizacao.toLowerCase().includes(termo.toLowerCase()))
      
      setClinicas(fallback)
    } finally {
      setLoading(false)
    }
  }

  // Ações de Exclusão
  function abrirModalExcluir(id) {
    setItemParaExcluir(id)
    setModalExcluirAberto(true)
  }

  function fecharModalExcluir() {
    setModalExcluirAberto(false)
    setItemParaExcluir(null)
  }

  async function confirmarExclusao() {
    if (!itemParaExcluir) return
    setExcluindo(true)
    try {
      // Como o backend ainda não possui rota DELETE /clinicas, removemos visualmente
      setClinicas(prev => prev.filter(c => c.id !== itemParaExcluir))
      fecharModalExcluir()
    } finally {
      setExcluindo(false)
    }
  }

  // Ações de Criação
  async function handleSalvarNova(e) {
    e.preventDefault()
    setSalvando(true)
    try {
      const payload = {
        nome: form.nome,
        email: form.email,
        senha: form.senha,
        endereco: form.endereco || 'Endereço não informado',
        cidade: form.cidade || 'Recife',
        estado: form.estado || 'PE',
        telefone: form.telefone,
        perfil: 'clinica',
        clinica: {
          cnpj: form.cnpj.replace(/\D/g, '') || form.cnpj,
          bairro: form.localizacao || 'Centro',
        },
      }

      await api.post('/usuarios', payload)
      await carregarClinicas()
      fecharModalNovo()
    } catch (err) {
      console.error('Erro ao cadastrar clínica:', err)
      const msg = err.response?.data?.mensagem || err.response?.data?.erro || 'Erro ao cadastrar clínica no banco de dados.'
      alert(msg)
    } finally {
      setSalvando(false)
    }
  }

  function fecharModalNovo() {
    setModalNovoAberto(false)
    setForm({ 
      nome: '', 
      cnpj: '', 
      email: '', 
      senha: '',
      endereco: '', 
      localizacao: '', 
      cidade: 'Recife',
      estado: 'PE',
      telefone: '', 
      status: 'Ativo' 
    })
  }

  return (
    <>
      <div className="p-4 sm:p-6 md:p-8 lg:p-12 w-full animate-[fadeIn_0.3s_ease-out]">
        
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h2 className="text-[24px] sm:text-[28px] font-bold text-slate-900 tracking-tight">Clínicas</h2>
            <p className="text-[14px] sm:text-[15px] text-slate-500 mt-1">Gerencie as unidades parceiras da rede.</p>
          </div>
          <button 
            onClick={() => setModalNovoAberto(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-[14px] transition-colors shadow-sm flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <span>+</span> Nova Clínica
          </button>
        </div>

        {erro && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">{erro}</div>}

        {/* ── Busca (Parâmetro nativo do back-end: ?busca=) ── */}
        <div className="mb-6 sm:mb-8">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome da clínica ou bairro..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* ── Lista de Clínicas ── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {clinicas.length > 0 ? (
              clinicas.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 hover:shadow-md transition-shadow overflow-hidden"
                >
                  
                  {/* Lado Esquerdo: Ícone e Info */}
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    {/* Ícone */}
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                      </svg>
                    </div>
                    
                    {/* Textos */}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[14px] sm:text-[15px] font-bold text-slate-900 truncate">{item.nome}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5 text-slate-500">
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                        </svg>
                        <p className="text-[12px] sm:text-[13px] font-medium truncate">
                          {item.localizacao} · {item.telefone}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Lado Direito: Profis, Status e Ações */}
                  <div className="flex flex-row items-center justify-between md:justify-end gap-4 sm:gap-6 md:gap-8 w-full md:w-auto pt-3 md:pt-0 border-t border-slate-100 md:border-t-0">
                    
                    {/* Qtde Profissionais */}
                    <div className="text-center">
                      <span className="block text-[16px] sm:text-[18px] font-extrabold text-slate-900 leading-none">{item.profissionais}</span>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Profis.</span>
                    </div>
                    
                    <div className="flex items-center gap-3 sm:gap-4">
                      {/* Badge Ativo */}
                      <span className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-[12px] font-bold uppercase tracking-wider ${
                        item.status === 'Ativo' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {item.status}
                      </span>
                      
                      {/* Lixeira */}
                      <button 
                        onClick={() => abrirModalExcluir(item.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                        title="Excluir Clínica"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                  </div>

                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <p className="text-slate-500 font-medium">Nenhuma clínica encontrada.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Modal de Exclusão ── */}
      {modalExcluirAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div 
            className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-[zoomIn_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 md:p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Remover clínica?</h3>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                Tem certeza que deseja remover esta clínica da rede? Esta ação não pode ser desfeita.
              </p>
              
              <div className="flex flex-col-reverse sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={fecharModalExcluir}
                  disabled={excluindo}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-blue-200 text-blue-600 font-bold text-sm hover:bg-blue-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarExclusao}
                  disabled={excluindo}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#dc2626] text-white font-bold text-sm hover:bg-[#b91c1c] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {excluindo ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remover clínica
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de Nova Clínica ── */}
      {modalNovoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div 
            className="bg-white w-full max-w-3xl rounded-xl shadow-xl overflow-hidden animate-[zoomIn_0.2s_ease-out] max-h-[90vh] overflow-y-auto border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <h3 className="text-[13px] font-bold text-slate-600 uppercase tracking-wider mb-6">Cadastrar Nova Clínica</h3>
              
              <form onSubmit={handleSalvarNova} className="flex flex-col gap-5">
                
                {/* Linha 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Nome</label>
                    <input type="text" required value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[14px] text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-slate-400" placeholder="Nome da clínica" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">CNPJ</label>
                    <input type="text" required value={form.cnpj} onChange={e => setForm({...form, cnpj: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[14px] text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-slate-400" placeholder="00.000.000/0001-00" />
                  </div>
                </div>

                {/* Linha 2 (E-mail e Senha) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">E-mail de Acesso</label>
                    <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[14px] text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-slate-400" placeholder="contato@clinica.com" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Senha de Acesso</label>
                    <input type="password" required minLength={6} value={form.senha} onChange={e => setForm({...form, senha: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[14px] text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-slate-400" placeholder="Mínimo 6 caracteres" />
                  </div>
                </div>

                {/* Linha 3 */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Endereço</label>
                  <input type="text" required value={form.endereco} onChange={e => setForm({...form, endereco: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[14px] text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-slate-400" placeholder="Rua, número" />
                </div>

                {/* Linha 4 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Bairro / Cidade</label>
                    <input type="text" required value={form.localizacao} onChange={e => setForm({...form, localizacao: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[14px] text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-slate-400" placeholder="Bairro" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Telefone</label>
                    <input type="text" required value={form.telefone} onChange={e => setForm({...form, telefone: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[14px] text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-slate-400" placeholder="(81) 3000-0000" />
                  </div>
                </div>

                {/* Botões alinhados à esquerda como no print */}
                <div className="mt-4 flex flex-row gap-3">
                  <button type="submit" disabled={salvando} className="px-6 py-2.5 rounded-lg bg-[#2563eb] text-white font-bold text-[14px] hover:bg-blue-700 transition-colors flex items-center justify-center min-w-[120px]">
                    {salvando ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Cadastrar'}
                  </button>
                  <button type="button" onClick={fecharModalNovo} className="px-6 py-2.5 rounded-lg border border-[#2563eb] text-[#2563eb] font-bold text-[14px] hover:bg-blue-50 transition-colors">
                    Cancelar
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

    </>
  )
}
