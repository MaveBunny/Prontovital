import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePaciente } from '../../../shared/hooks/usePaciente'
import { useAuth } from '../../../shared/hooks/useAuth'
import { deletarPerfil } from '../../../lib/pacientesApi'

export default function MeuPerfilPage() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  // Perfil completo — GET /pacientes/:id_paciente (backend real)
  const { paciente, carregando } = usePaciente()

  const [modalExcluir, setModalExcluir] = useState(false)
  const [excluindo, setExcluindo] = useState(false)
  const [erro, setErro] = useState('')

  // Dados reais retornados pelo backend (User + Paciente)
  const perfil = paciente || {}

  // ── Campos reais do backend (User + Paciente) ──────────────────────────
  const nomeExibicao = perfil.nome || usuario?.nome || '—'
  const emailExibicao = perfil.email || usuario?.email || '—'
  const cpfExibicao = perfil.cpf || '—'
  const telefoneExibicao = perfil.telefone || usuario?.telefone || '—'
  const enderecoExibicao = perfil.endereco || usuario?.endereco || '—'
  const cidadeEstado =
    perfil.cidade && perfil.estado
      ? `${perfil.cidade} / ${perfil.estado}`
      : perfil.cidade || perfil.estado || '—'
  const sexoExibicao = perfil.sexo || '—'

  // Formata data de nascimento de "YYYY-MM-DD" para "DD/MM/AAAA"
  const dataNascExibicao = perfil.data_nascimento
    ? (() => {
        const [ano, mes, dia] = perfil.data_nascimento.split('T')[0].split('-')
        return `${dia}/${mes}/${ano}`
      })()
    : '—'

  // ── Campo clínico real do backend (Paciente.observacoes) ─────────────────
  const observacoesExibicao = perfil.observacoes || '—'

  const iniciais = nomeExibicao
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '?'

  async function handleConfirmarExclusao() {
    setExcluindo(true)
    setErro('')
    try {
      // PATCH /usuarios/perfil/cancelar — desativa a conta (ativo = false)
      await deletarPerfil(perfil.id_user || usuario?.id_user)
      logout()
      navigate('/')
    } catch {
      setErro('Erro ao excluir conta. Tente novamente.')
      setExcluindo(false)
      setModalExcluir(false)
    }
  }

  return (
    <div className="p-6 md:p-10 lg:p-12 w-full max-w-2xl animate-[fadeIn_0.3s_ease-out]">
      
      {/* ── Carregando perfil do backend ── */}
      {carregando && !paciente && (
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      )}

      {!carregando && (
      <>
      {/* ── Card Principal do Perfil (conforme Imagem 2) ── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 md:p-8 mb-6">
        
        {/* Header do Usuário: Avatar, Nome, Papel + Editar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0">
            {iniciais}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[17px] font-bold text-slate-900 leading-tight">
              {nomeExibicao}
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Paciente
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/paciente/editar-perfil')}
            className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer shadow-2xs"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
            </svg>
            Editar perfil
          </button>
        </div>

        {/* Divisor */}
        <div className="border-t border-slate-100 my-5" />

        {/* Dados Cadastrais — campos reais do backend (User + Paciente) */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="block text-xs font-semibold text-slate-700 mb-1">CPF</span>
              <span className="block text-xs text-slate-500 font-normal">{cpfExibicao}</span>
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-700 mb-1">E-mail</span>
              <span className="block text-xs text-slate-500 font-normal">{emailExibicao}</span>
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-700 mb-1">Telefone</span>
              <span className="block text-xs text-slate-500 font-normal">{telefoneExibicao}</span>
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-700 mb-1">Sexo</span>
              <span className="block text-xs text-slate-500 font-normal">{sexoExibicao}</span>
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-700 mb-1">Data de Nascimento</span>
              <span className="block text-xs text-slate-500 font-normal">{dataNascExibicao}</span>
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-700 mb-1">Cidade / Estado</span>
              <span className="block text-xs text-slate-500 font-normal">{cidadeEstado}</span>
            </div>
          </div>

          {enderecoExibicao !== '—' && (
            <div>
              <span className="block text-xs font-semibold text-slate-700 mb-1">Endereço</span>
              <span className="block text-xs text-slate-500 font-normal">{enderecoExibicao}</span>
            </div>
          )}
        </div>

        {/* Divisor */}
        <div className="border-t border-slate-100 my-5" />

        {/* Seção Observações clínicas (campo real do backend) */}
        <div>
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
            OBSERVAÇÕES CLÍNICAS
          </h3>

          <div className="space-y-4">
            <div>
              <span className="block text-xs font-semibold text-slate-700 mb-1">
                Observações
              </span>
              <span className="block text-xs text-slate-500 font-normal">
                {observacoesExibicao}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* ── Card: Zona de Risco (conforme Imagem 2) ── */}
      <div className="bg-rose-50/40 border border-rose-200/80 rounded-2xl p-6">
        <h3 className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">
          ZONA DE RISCO
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Excluir permanentemente sua conta e todos os dados.
        </p>

        {erro && (
          <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl mb-3">
            {erro}
          </p>
        )}

        <button
          onClick={() => setModalExcluir(true)}
          className="px-4 py-2 bg-white border border-rose-300 hover:bg-rose-50 text-rose-600 font-semibold text-xs rounded-xl transition-colors cursor-pointer shadow-2xs"
        >
          Excluir conta
        </button>
      </div>

      {/* ── Modal de Confirmação de Exclusão ── */}
      {modalExcluir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-100 animate-[zoomIn_0.2s_ease-out]">
            <h3 className="text-xl font-bold text-slate-900">Excluir conta?</h3>
            <p className="text-sm text-slate-500 mt-2 mb-6 leading-relaxed">
              Tem certeza que deseja excluir permanentemente sua conta? Todos os seus dados pessoais, histórico de triagens e consultas agendadas serão removidos.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setModalExcluir(false)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarExclusao}
                disabled={excluindo}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm disabled:opacity-60"
              >
                {excluindo ? 'Excluindo...' : 'Sim, Excluir Minha Conta'}
              </button>
            </div>
          </div>
        </div>
      )}

      </>
      )}

    </div>
  )
}
