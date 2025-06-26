import React from 'react'

const EditorVisual = ({ visual, updateVisual, handleVisualSubmit, setMostrarEditorVisual, handleImageUpload, handleLogoUpload }) => {
  return (
    <div className="editor-modal">
      <div className="editor-box">
        <h3>Personalización Visual</h3>
        <form onSubmit={handleVisualSubmit}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            
            {/* Colores */}
            <div className="form-group" style={{ flex: 1 }}>
              <label>Color Primario</label>
              <input
                type="color"
                value={visual.color_primario}
                onChange={(e) => updateVisual('color_primario', e.target.value)}
                style={{
                  border: 'none',
                  height: '40px',
                  width: '100%',
                  borderRadius: '8px',
                  background: 'none',
                  padding: 0,
                  cursor: 'pointer'
                }}
              />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label>Color Secundario</label>
              <input
                type="color"
                value={visual.color_secundario}
                onChange={(e) => updateVisual('color_secundario', e.target.value)}
                style={{
                  border: 'none',
                  height: '40px',
                  width: '100%',
                  borderRadius: '8px',
                  background: 'none',
                  padding: 0,
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* Imágenes */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', width: '100%' }}>
              <div className="form-group" style={{ flex: '1 1 45%' }}>
                <label>Imagen de fondo</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} />
                {visual.fondo_url && (
                  <img src={visual.fondo_url} alt="Vista previa fondo" style={{ width: '100%', marginTop: '0.5rem', borderRadius: '8px' }} />
                )}
              </div>

              <div className="form-group" style={{ flex: '1 1 45%' }}>
                <label>Logo</label>
                <input type="file" accept="image/*" onChange={handleLogoUpload} />
                {visual.logo_url && (
                  <img src={visual.logo_url} alt="Vista previa logo" style={{ maxWidth: '120px', marginTop: '0.5rem', borderRadius: '8px' }} />
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
            <button type="submit" className="secondary">Guardar</button>
            <button type="button" className="secondary" onClick={() => setMostrarEditorVisual(false)}>Cerrar</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditorVisual
