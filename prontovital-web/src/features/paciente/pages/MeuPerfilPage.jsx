import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { meuPerfil, deletarPerfil, getPerfilDinamico } from '../../../lib/pacientesApi'
import { useAuth } from '../../../shared/hooks/useAuth'

export default function MeuPerfilPage() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const [perfil, setPerfil] = useState(() => getPerfilDinamico())
  const [modalExcluir, setModalExcluir] = useState(false)
  const [excluindo, setExcluindo] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    async function carregar() {
      try {
        const data = await meuPerfil()
        if (data) setPerfil(data)
      } catch {
        setPerfil(getPerfilDinamico())
      }
    }
    carregar()
  }, [usuario])

  const nomeExibicao = perfil.nome || usuario?.nome || 'Severino Cavalcanti'
  const emailExibicao = perfil.email || usuario?.email || 'severino@email.com'
  const cpfExibicao = perfil.cpf || usuario?.paciente?.cpf || '12345678900'

  const tipoSanguineo = perfil.dadosSaude?.tipoSanguineo || 'A+'
  const alergias = perfil.dadosSaude?.alergias || 'Dipirona'
  const medicamentos = perfil.dadosSaude?.medicamentos || '—'
  const comorbidades = perfil.dadosSaude?.comorbidades || 'Hipertensão, Diabetes Tipo 2'

  const iniciais = nomeExibicao
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'SC'

  async function handleConfirmarExclusao() {
    setExcluindo(true)
    setErro('')
    try {
      await deletarPerfil(perfil.id || perfil.id_user || usuario?.id_user || 1)
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
      
      {/* ── Card Principal do Perfil (conforme Imagem 2) ── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 md:p-8 mb-6">
        
        {/* Header do Usuário: Avatar, Nome, Papel */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0">
            {iniciais}
          </div>
          <div>
            <h2 className="text-[17px] font-bold text-slate-900 leading-tight">
              {nomeExibicao}
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Paciente
            </p>
          </div>
        </div>

        {/* Divisor */}
        <div className="border-t border-slate-100 my-5" />

        {/* Dados Cadastrais: CPF e E-mail */}
        <div className="space-y-4">
          <div>
            <span className="block text-xs font-semibold text-slate-700 mb-1">
              CPF
            </span>
            <span className="block text-xs text-slate-500 font-normal">
              {cpfExibicao}
            </span>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-700 mb-1">
              E-mail
            </span>
            <span className="block text-xs text-slate-500 font-normal">
              {emailExibicao}
            </span>
          </div>
        </div>

        {/* Divisor */}
        <div className="border-t border-slate-100 my-5" />

        {/* Seção Dados de Saúde */}
        <div>
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
            DADOS DE SAÚDE
          </h3>

          <div className="space-y-4">
            <div>
              <span className="block text-xs font-semibold text-slate-700 mb-1">
                Tipo sanguíneo
              </span>
              <span className="block text-xs text-slate-500 font-normal">
                {tipoSanguineo}
              </span>
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-700 mb-1">
                Alergias
              </span>
              <span className="block text-xs text-slate-500 font-normal">
                {alergias}
              </span>
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-700 mb-1">
                Medicamentos em uso
              </span>
              <span className="block text-xs text-slate-500 font-normal">
                {medicamentos}
              </span>
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-700 mb-1">
                Comorbidades
              </span>
              <span className="block text-xs text-slate-500 font-normal">
                {comorbidades}
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

    </div>
  )
}
