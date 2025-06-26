import supabase from '../supabaseClient'

export const fetchRestauranteConfig = async (slug) => {
  const { data, error } = await supabase
    .from('restaurantes')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error al obtener configuración:', error)
    return null
  }

  return data
}
