import { useCallback, useEffect, useState } from 'react'
import { meuPerfil, editarPerfil } from '../../lib/pacientesApi'
import { useAuth } from './useAuth'

/**
 * Hook para gerenciar dados do perfil do paciente logado
 */
export function usePaciente() {
  const { usuario } = useAuth()
  const [paciente, setPaciente] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)

  const carregarPerfil = useCallback(async () => {
    if (!usuario) return
    setCarregando(true)
    setErro(null)
    try {
      const data = await meuPerfil()
      setPaciente(data)
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao carregar perfil.')
    } finally {
      setCarregando(false)
    }
  }, [usuario])

  useEffect(() => {
    carregarPerfil()
  }, [carregarPerfil])

  const atualizar = useCallback(async (payload) => {
    if (!paciente?.id) return
    setCarregando(true)
    try {
      const data = await editarPerfil(paciente.id, payload)
      setPaciente(data)
      return data
    } finally {
      setCarregando(false)
    }
  }, [paciente])

  return { paciente, carregando, erro, recarregar: carregarPerfil, atualizar }
}
