"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "../services/supabase"

/**
 * Hook personalizado para gerenciar consultas ao Supabase com cache
 * @param {string} table - Nome da tabela
 * @param {Object} options - Opções de consulta
 * @param {boolean} options.enabled - Se a consulta deve ser executada
 * @param {Function} options.queryFn - Função personalizada para consulta
 * @param {Array} options.dependencies - Dependências para reexecutar a consulta
 * @param {string} options.cacheKey - Chave para armazenar no cache
 * @param {number} options.staleTime - Tempo em ms para considerar os dados obsoletos
 */
export function useSupabaseQuery(table, options = {}) {
  const {
    enabled = true,
    queryFn,
    dependencies = [],
    cacheKey,
    staleTime = 5 * 60 * 1000, // 5 minutos por padrão
  } = options

  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const lastFetchedRef = useRef(0)
  const isMountedRef = useRef(true)

  // Função para verificar o cache
  const checkCache = () => {
    if (!cacheKey) return null

    const cached = sessionStorage.getItem(cacheKey)
    if (!cached) return null

    try {
      const { data: cachedData, timestamp } = JSON.parse(cached)
      const isStale = Date.now() - timestamp > staleTime

      if (!isStale) {
        return cachedData
      }
    } catch (e) {
      console.error("Erro ao ler cache:", e)
      sessionStorage.removeItem(cacheKey)
    }

    return null
  }

  // Função para salvar no cache
  const saveToCache = (data) => {
    if (!cacheKey) return

    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      }
      sessionStorage.setItem(cacheKey, JSON.stringify(cacheData))
    } catch (e) {
      console.error("Erro ao salvar no cache:", e)
    }
  }

  const fetchData = async () => {
    if (!enabled) {
      setLoading(false)
      return
    }

    // Verifica se já buscou recentemente
    const now = Date.now()
    if (now - lastFetchedRef.current < 500) {
      return // Evita múltiplas requisições em sequência
    }

    lastFetchedRef.current = now

    // Verifica o cache primeiro
    const cachedData = checkCache()
    if (cachedData) {
      setData(cachedData)
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      let result

      if (queryFn) {
        // Usa a função de consulta personalizada
        result = await queryFn()
      } else {
        // Consulta padrão
        const { data, error } = await supabase.from(table).select("*")

        if (error) throw error
        result = data
      }

      if (isMountedRef.current) {
        setData(result)
        setError(null)
        saveToCache(result)
      }
    } catch (err) {
      if (isMountedRef.current) {
        console.error(`Erro ao buscar dados da tabela ${table}:`, err)
        setError(err)
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    isMountedRef.current = true
    fetchData()

    return () => {
      isMountedRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, enabled, ...dependencies])

  return {
    data,
    error,
    loading,
    refetch: fetchData,
  }
}

